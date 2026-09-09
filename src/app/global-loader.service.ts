import { Injectable, computed, signal } from '@angular/core';

type LoadingTask = {
  id: number;
  message: string;
  startedAt: number;
};

@Injectable({ providedIn: 'root' })
export class GlobalLoaderService {
  private readonly tasks = signal<LoadingTask[]>([]);
  private nextId = 0;

  readonly visible = computed(() => this.tasks().length > 0);
  readonly message = computed(
    () => this.tasks().at(-1)?.message || 'Loading your workspace…',
  );

  begin(message = 'Loading your workspace…') {
    const task: LoadingTask = {
      id: ++this.nextId,
      message,
      startedAt: Date.now(),
    };
    this.tasks.update((tasks) => [...tasks, task]);
    return task.id;
  }

  end(id: number) {
    const task = this.tasks().find((item) => item.id === id);
    if (!task) return;

    const remaining = Math.max(0, 450 - (Date.now() - task.startedAt));
    setTimeout(() => {
      this.tasks.update((tasks) => tasks.filter((item) => item.id !== id));
    }, remaining);
  }
}
