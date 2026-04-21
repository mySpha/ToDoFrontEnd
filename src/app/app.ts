import { Component, signal } from '@angular/core';
import { TodoApp } from './components/todo-app/todo-app';
import { NgxSpinnerModule } from 'ngx-spinner';

@Component({
  selector: 'app-root',
  imports: [ TodoApp,NgxSpinnerModule],
  templateUrl: './app.html',
  styleUrl: './app.css',
})
export class App {
  protected readonly title = signal('todoApp');
}
