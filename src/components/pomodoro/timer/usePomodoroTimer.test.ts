// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach, afterEach, Mock } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { usePomodoroTimer } from './usePomodoroTimer';
import { usePomodoro } from '../PomodoroProvider';
import * as pomodoroService from '@/services/pomodoroService';
import * as taskService from '@/services/tasks';

// Mock the context
vi.mock('../PomodoroProvider', () => ({
  usePomodoro: vi.fn(),
}));

// Mock services
vi.mock('@/services/pomodoroService', () => ({
  logPomodoroDistraction: vi.fn(),
}));
vi.mock('@/services/tasks', () => ({
  updateTask: vi.fn(),
}));

// Mock requestAnimationFrame
const requestAnimationFrameMock = vi.fn();
const cancelAnimationFrameMock = vi.fn();

global.requestAnimationFrame = requestAnimationFrameMock;
global.cancelAnimationFrame = cancelAnimationFrameMock;

// Helper to simulate RAF ticks
const advanceTime = (time: number) => {
  // Get the most recent callback passed to requestAnimationFrame
  const callback = requestAnimationFrameMock.mock.calls[requestAnimationFrameMock.mock.calls.length - 1]?.[0];
  if (callback) {
    // Simulate time passing for the timer loop
    // The timer loop itself checks Date.now(), so we need to advance system time
    vi.advanceTimersByTime(time);
    // Call the RAF callback
    callback();
  }
};


describe('usePomodoroTimer', () => {
  let mockUsePomodoroData: any;
  const initialTask = { id: 'task-initial', title: 'Initial Test Task' };

  beforeEach(() => {
    vi.useFakeTimers(); // Use fake timers

    mockUsePomodoroData = {
      timerSettings: {
        workDuration: 25,
        breakDuration: 5,
        longBreakDuration: 15,
        sessionsBeforeLongBreak: 4,
      },
      selectedTask: initialTask, // Start with a selected task for some tests
      isTimerRunning: false,
      completedCount: 0,
      completePomodoro: vi.fn(() => Promise.resolve()),
      setIsTimerRunning: vi.fn((isRunning: boolean) => {
        mockUsePomodoroData.isTimerRunning = isRunning; // Simulate context update
      }),
      currentSession: 1,
      setCurrentSession: vi.fn(),
      currentSessionId: 'session-123',
      logDistraction: vi.fn(() => Promise.resolve()),
      setDistractions: vi.fn(),
    };

    (usePomodoro as Mock).mockReturnValue(mockUsePomodoroData);
    requestAnimationFrameMock.mockClear();
    cancelAnimationFrameMock.mockClear();
    // Reset document.title mock if it was spied on.
    // If vi.spyOn(document, 'title', 'set') was used, it's restored in afterEach.
    // If not, ensure document.title is a simple string for testing.
    document.title = 'Initial Title'; 
    // Clear any previous spies on document.title if they weren't restored.
    // This is safer if tests are run in a context where spies might persist.
    vi.restoreAllMocks(); // This will restore document.title if spied
    vi.spyOn(document, 'title', 'set'); // Re-apply spy for each test
  });

  afterEach(() => {
    vi.restoreAllMocks(); // Restore all mocks, including document.title spy
    vi.useRealTimers(); // Use real timers
  });

  it('1. should initialize with the correct default state', () => {
    const { result } = renderHook(() => usePomodoroTimer());
    expect(result.current.state.status).toBe('idle');
    expect(result.current.state.timeRemaining).toBe(25 * 60);
    expect(result.current.state.isBreak).toBe(false);
    expect(result.current.state.originalDuration).toBe(25 * 60);
    expect(result.current.state.currentTask).toEqual(initialTask); // from selectedTask
  });

  describe('2. Starting Work Session', () => {
    it('should start the timer, update state, and tick down', () => {
      const task = { id: 'task-1', title: 'Test Task' };
      mockUsePomodoroData.selectedTask = task; // Ensure this is the task for this test
      
      const { result, rerender } = renderHook(() => usePomodoroTimer());
       // Initialize with the selected task via useEffect
      act(() => {
        rerender(); 
      });

      act(() => {
        mockUsePomodoroData.setIsTimerRunning(true);
        rerender();
      });
      
      expect(mockUsePomodoroData.setIsTimerRunning).toHaveBeenCalledWith(true);
      expect(result.current.isTimerRunning).toBe(true); 
      expect(result.current.state.status).toBe('running');
      expect(result.current.state.isBreak).toBe(false);
      expect(result.current.state.currentTask).toEqual(task);
      expect(result.current.state.timeRemaining).toBe(25 * 60);
      expect(requestAnimationFrameMock).toHaveBeenCalledTimes(1); 

      act(() => {
        advanceTime(1000); 
      });
       expect(result.current.state.timeRemaining).toBe(25 * 60 - 1);
       expect(document.title).toBe(`${result.current.formatTime(25 * 60 - 1)} | Focus - Reflect`);

      act(() => {
        advanceTime(1000); 
      });
      expect(result.current.state.timeRemaining).toBe(25 * 60 - 2);
    });
  });

  describe('3. Pausing and Resuming Work Session', () => {
    it('should pause and resume the timer', () => {
      const task = { id: 'task-1', title: 'Test Task' };
      mockUsePomodoroData.selectedTask = task;
      const { result, rerender } = renderHook(() => usePomodoroTimer());
      act(() => { rerender(); }); // Apply selectedTask

      act(() => {
        mockUsePomodoroData.setIsTimerRunning(true); 
        rerender();
      });
      
      act(() => {
        advanceTime(1000); 
      });
      expect(result.current.state.timeRemaining).toBe(25 * 60 - 1);

      act(() => {
        result.current.pausePomodoro();
        rerender(); 
      });

      expect(mockUsePomodoroData.setIsTimerRunning).toHaveBeenCalledWith(false);
      expect(result.current.isTimerRunning).toBe(false);
      expect(result.current.state.status).toBe('paused');
      const timeWhenPaused = result.current.state.timeRemaining;
      expect(cancelAnimationFrameMock).toHaveBeenCalled();

      act(() => {
        advanceTime(2000); 
      });
      expect(result.current.state.timeRemaining).toBe(timeWhenPaused);

      act(() => {
        result.current.resumePomodoro();
        rerender(); 
      });

      expect(mockUsePomodoroData.setIsTimerRunning).toHaveBeenCalledWith(true);
      expect(result.current.isTimerRunning).toBe(true);
      expect(result.current.state.status).toBe('running');
      
      expect(requestAnimationFrameMock.mock.calls.length).toBeGreaterThanOrEqual(2);

      act(() => {
        advanceTime(1000); 
      });
      expect(result.current.state.timeRemaining).toBe(timeWhenPaused - 1);
    });
  });

  describe('4. Completing a Work Session', () => {
    it('should call onComplete, completePomodoro, and update state', () => {
      const onCompleteMock = vi.fn();
      const task = { id: 'task-1', title: 'Test Task' };
      mockUsePomodoroData.selectedTask = task;
      mockUsePomodoroData.timerSettings.workDuration = 1 / 60; 

      const { result, rerender } = renderHook(() => usePomodoroTimer({ onComplete: onCompleteMock }));
      act(() => { rerender(); }); // Apply selectedTask & new settings

      act(() => {
        mockUsePomodoroData.setIsTimerRunning(true);
        rerender();
      });

      expect(result.current.state.timeRemaining).toBe(1);

      act(() => {
        advanceTime(1000); 
        for(let i=0; i<5 && result.current.state.status !== 'completed'; i++) {
            const cb = requestAnimationFrameMock.mock.calls[requestAnimationFrameMock.mock.calls.length - 1]?.[0];
            if(cb) cb(); else break;
        }
      });
      
      expect(result.current.state.status).toBe('completed');
      expect(onCompleteMock).toHaveBeenCalled();
      expect(mockUsePomodoroData.completePomodoro).toHaveBeenCalled();
      expect(result.current.showCompletionDialog).toBe(true);
    });
  });

  describe('5. Starting a Break', () => {
    it('should update state for break session', () => {
      const { result, rerender } = renderHook(() => usePomodoroTimer());
      
      act(() => {
        result.current.setState(prev => ({ ...prev, status: 'completed', currentTask: initialTask }));
        result.current.setShowCompletionDialog(true); 
      });

      act(() => {
        result.current.handleStartBreak();
        rerender();
      });

      expect(mockUsePomodoroData.setIsTimerRunning).toHaveBeenCalledWith(true);
      expect(result.current.isTimerRunning).toBe(true);
      expect(result.current.state.isBreak).toBe(true);
      expect(result.current.state.status).toBe('running');
      expect(result.current.state.timeRemaining).toBe(mockUsePomodoroData.timerSettings.breakDuration * 60);
      expect(result.current.state.currentTask).toEqual(initialTask); // Task should persist into break
      expect(result.current.showCompletionDialog).toBe(false);
      expect(requestAnimationFrameMock).toHaveBeenCalled();
    });
  });

  describe('6. Pausing and Resuming Break Session', () => {
     it('should pause and resume the break timer', () => {
      const { result, rerender } = renderHook(() => usePomodoroTimer());
      act(() => { rerender(); }); // Apply initialTask

      act(() => {
        result.current.handleStartBreak(); // This will set currentTask from selectedTask
        rerender();
      });
      
      act(() => {
        advanceTime(1000); 
      });
      expect(result.current.state.timeRemaining).toBe(mockUsePomodoroData.timerSettings.breakDuration * 60 - 1);

      act(() => {
        result.current.pausePomodoro();
        rerender();
      });

      expect(result.current.isTimerRunning).toBe(false);
      expect(result.current.state.status).toBe('paused');
      const timeWhenPaused = result.current.state.timeRemaining;

      act(() => {
        advanceTime(2000); 
      });
      expect(result.current.state.timeRemaining).toBe(timeWhenPaused);

      act(() => {
        result.current.resumePomodoro();
        rerender();
      });

      expect(result.current.isTimerRunning).toBe(true);
      expect(result.current.state.status).toBe('running');
      
      act(() => {
        advanceTime(1000); 
      });
      expect(result.current.state.timeRemaining).toBe(timeWhenPaused - 1);
      expect(document.title).toContain('Break');
    });
  });

  describe('7. Skipping a Break Session', () => {
    it('should transition to a new work session', () => {
      const { result, rerender } = renderHook(() => usePomodoroTimer());
      act(() => { rerender(); }); // Apply initialTask
      
       act(() => {
        result.current.setState(prev => ({ ...prev, status: 'completed', currentTask: initialTask }));
        result.current.setShowCompletionDialog(true);
      });

      act(() => {
        result.current.handleSkipBreak();
        rerender();
      });

      expect(mockUsePomodoroData.setIsTimerRunning).toHaveBeenCalledWith(true);
      expect(result.current.isTimerRunning).toBe(true);
      expect(result.current.state.isBreak).toBe(false);
      expect(result.current.state.status).toBe('running');
      expect(result.current.state.timeRemaining).toBe(mockUsePomodoroData.timerSettings.workDuration * 60);
      expect(result.current.state.currentTask).toEqual(initialTask); // Task should persist
      expect(result.current.showCompletionDialog).toBe(false);
      expect(requestAnimationFrameMock).toHaveBeenCalled();
    });
  });

  describe('8. Break Session Completing', () => {
    it('should automatically transition to a new work session', () => {
      mockUsePomodoroData.timerSettings.breakDuration = 1 / 60;
      const { result, rerender } = renderHook(() => usePomodoroTimer());
      act(() => { rerender(); }); // Apply initialTask & settings

      act(() => {
        result.current.handleStartBreak();
        rerender();
      });
      expect(result.current.state.timeRemaining).toBe(1); 
      expect(result.current.state.isBreak).toBe(true);
      expect(result.current.state.currentTask).toEqual(initialTask);


      act(() => {
        advanceTime(1000); 
         for(let i=0; i<5 && result.current.state.isBreak; i++) { 
            const cb = requestAnimationFrameMock.mock.calls[requestAnimationFrameMock.mock.calls.length - 1]?.[0];
            if(cb) cb(); else break;
        }
      });
      
      expect(result.current.state.isBreak).toBe(false);
      expect(result.current.state.status).toBe('running');
      expect(result.current.state.timeRemaining).toBe(mockUsePomodoroData.timerSettings.workDuration * 60);
      expect(result.current.state.currentTask).toEqual(initialTask); // Task persists
    });
  });
  
  describe('9. Stopping the Timer', () => {
    it('should reset to idle, clear task, and set work duration if stopped during a WORK session', () => {
      const task = { id: 'task-st-work', title: 'Stop Work Task' };
      mockUsePomodoroData.selectedTask = task;
      const { result, rerender } = renderHook(() => usePomodoroTimer());
      act(() => { rerender(); }); // Apply task

      // Start timer (work session)
      act(() => {
        mockUsePomodoroData.setIsTimerRunning(true);
        rerender();
      });
      act(() => { advanceTime(1000); }); // Run for a bit
      expect(result.current.state.status).toBe('running');
      expect(result.current.state.isBreak).toBe(false);
      expect(result.current.state.currentTask).toEqual(task);

      act(() => {
        result.current.stopPomodoro();
        rerender();
      });
      
      expect(mockUsePomodoroData.setIsTimerRunning).toHaveBeenCalledWith(false);
      expect(result.current.isTimerRunning).toBe(false); // from context mock
      expect(result.current.state.status).toBe('idle');
      expect(result.current.state.timeRemaining).toBe(mockUsePomodoroData.timerSettings.workDuration * 60);
      expect(result.current.state.isBreak).toBe(false);
      expect(result.current.state.currentTask).toBeUndefined(); // Key change: currentTask is cleared
      expect(cancelAnimationFrameMock).toHaveBeenCalled();
    });

    it('should transition to a new work session if stopped during a BREAK session', () => {
      const task = { id: 'task-st-break', title: 'Stop Break Task' };
      mockUsePomodoroData.selectedTask = task; // Task that will be used for the break and subsequent work session
      const { result, rerender } = renderHook(() => usePomodoroTimer());
      act(() => { rerender(); }); // Apply task

      // Start a break session
      act(() => {
        // Simulate being in a break state (e.g., after handleStartBreak)
        result.current.setState(prev => ({
          ...prev,
          isBreak: true,
          status: 'running',
          timeRemaining: mockUsePomodoroData.timerSettings.breakDuration * 60 - 10, // Mid-break
          originalDuration: mockUsePomodoroData.timerSettings.breakDuration * 60,
          currentTask: task, // Task is present during break
        }));
        mockUsePomodoroData.setIsTimerRunning(true); // Ensure context reflects running
        rerender();
      });
      
      expect(result.current.state.isBreak).toBe(true);
      expect(result.current.state.status).toBe('running');
      expect(result.current.state.currentTask).toEqual(task);

      const previousTimestamp = result.current.state.startTimestamp;

      act(() => {
        result.current.stopPomodoro();
        rerender();
      });

      // Assertions for transitioning to a new work session
      expect(mockUsePomodoroData.setIsTimerRunning).toHaveBeenCalledWith(true); // Should set timer to running
      expect(result.current.isTimerRunning).toBe(true); // from context mock

      expect(result.current.state.status).toBe('running');
      expect(result.current.state.isBreak).toBe(false);
      expect(result.current.state.timeRemaining).toBe(mockUsePomodoroData.timerSettings.workDuration * 60);
      expect(result.current.state.originalDuration).toBe(mockUsePomodoroData.timerSettings.workDuration * 60);
      expect(result.current.state.currentTask).toEqual(task); // Task should persist
      expect(result.current.state.startTimestamp).not.toBe(previousTimestamp); // Timestamp should be new
      expect(result.current.state.startTimestamp).toBeGreaterThan(0); // Should be a valid timestamp
      
      // Check if animation is restarted (it should be if status is running)
      // animationStartedRef is internal, but stopPomodoro sets it to false,
      // then the useEffect for isTimerRunning && state.status === 'running' should restart it.
      // This means startTimerAnimation would be called.
      // The exact number of calls to requestAnimationFrameMock can be tricky due to multiple calls
      // during setup and transitions. We expect at least one new call for the new work session.
      expect(requestAnimationFrameMock.mock.calls.length).toBeGreaterThanOrEqual(1); 
    });
  });

  describe('10. Settings Change', () => {
    it('should use new work duration for the next session (after stop and start)', () => {
      const { result, rerender } = renderHook(() => usePomodoroTimer());
      act(() => { rerender(); });// Apply initial selectedTask
      
      act(() => {
        mockUsePomodoroData.setIsTimerRunning(true);
        rerender();
      });
      act(() => { advanceTime(1000); });
      expect(result.current.state.timeRemaining).toBe(25 * 60 - 1);

      act(() => {
        result.current.stopPomodoro(); // This will clear currentTask
        rerender();
      });
      expect(result.current.state.status).toBe('idle');
      expect(result.current.state.timeRemaining).toBe(25 * 60); 
      expect(result.current.state.currentTask).toBeUndefined();


      mockUsePomodoroData.timerSettings = { ...mockUsePomodoroData.timerSettings, workDuration: 30 };
      mockUsePomodoroData.selectedTask = { id: 'new-task', title: 'New Task after settings change'}; // Simulate selecting a new task
      act(() => { rerender(); }); 

      // useEffect for settings/selectedTask change when idle/completed should update timeRemaining & task
      expect(result.current.state.timeRemaining).toBe(30 * 60);
      expect(result.current.state.originalDuration).toBe(30*60);
      expect(result.current.state.currentTask).toEqual(mockUsePomodoroData.selectedTask);


      act(() => {
        mockUsePomodoroData.setIsTimerRunning(true);
        rerender();
      });
      expect(result.current.state.status).toBe('running');
      expect(result.current.state.timeRemaining).toBe(30 * 60); 
      act(() => { advanceTime(1000); });
      expect(result.current.state.timeRemaining).toBe(30 * 60 - 1);
    });

     it('should not affect current running session duration', () => {
      const { result, rerender } = renderHook(() => usePomodoroTimer());
      act(() => { rerender(); });
      
      act(() => {
        mockUsePomodoroData.setIsTimerRunning(true);
        rerender();
      });
      act(() => { advanceTime(1000); }); 
      expect(result.current.state.originalDuration).toBe(25 * 60);

      mockUsePomodoroData.timerSettings = { ...mockUsePomodoroData.timerSettings, workDuration: 30 };
      act(() => { rerender(); });

      expect(result.current.state.originalDuration).toBe(25 * 60); 
      expect(result.current.state.timeRemaining).toBe(25 * 60 - 1);

      act(() => { advanceTime(1000); });
      expect(result.current.state.timeRemaining).toBe(25 * 60 - 2); 
    });
  });
  
  describe('11. `setTimerToFiveSeconds` Utility', () => {
    it('should set timeRemaining to 5 seconds', () => {
      const { result, rerender } = renderHook(() => usePomodoroTimer());
      act(() => { rerender(); });
      
      act(() => {
        result.current.setTimerToFiveSeconds();
      });
      
      expect(result.current.state.timeRemaining).toBe(5);
      expect(result.current.state.originalDuration).toBe(mockUsePomodoroData.timerSettings.workDuration * 60);
    });
  });
});

[end of src/components/pomodoro/timer/usePomodoroTimer.test.ts]
