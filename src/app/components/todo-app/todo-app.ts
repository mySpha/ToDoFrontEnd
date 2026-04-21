/* eslint-disable no-debugger */
import { AfterViewInit, Component, ElementRef, OnInit, signal, computed, inject} from '@angular/core';
import { CommonModule } from '@angular/common';
import { TodoModel } from './model/todo-model';
import { FormsModule } from '@angular/forms';
import Prism from 'prismjs';
import { HttpClient } from '@angular/common/http';
import { ServiceResponse } from './model/serviceResponse';
import { ToDoStatusModel } from './model/todo-status';
import { NgxSpinnerService } from 'ngx-spinner';

@Component({
  selector: 'app-todo-app',
  imports: [FormsModule, CommonModule,],
  templateUrl: './todo-app.html',
  styleUrl: './todo-app.css',
})
export class TodoApp implements OnInit,AfterViewInit {

  task: TodoModel = {
  itemId: 0,
  title: '',
  description: '',
  statusId: 1,
  eventId: 1
  };
  
  todoList = signal<TodoModel[]>([]);
  statuses = signal<ToDoStatusModel[]>([]);
  localStorageKey = "todoItems";
  selectedStatus = signal<number | null>(null);
  http = inject(HttpClient);
  spinner = inject(NgxSpinnerService);

 // eslint-disable-next-line @angular-eslint/prefer-inject
 constructor(private el: ElementRef ) {}


  ngOnInit(): void {
    this.getTodosFromServer();
    this.getStatusesFromServer();
  }

  private getToDosFromLocal() {
   try {
     const localData = localStorage.getItem(this.localStorageKey);
     if(!localData)
     {
       this.todoList.set([]);
       return;
     }

     const parsed: TodoModel[] = JSON.parse(localData);
     this.todoList.set(parsed);
   } 
   catch (error) {
    console.error('Error reading local storage', error);
    this.todoList.set([]);
   }
  }

  ngAfterViewInit(): void {
    Prism.highlightAllUnder(this.el.nativeElement);
  }

  getTodosFromServer(){
    this.http.get<ServiceResponse<TodoModel[]>>('https://localhost:7036/api/ToDo').
    subscribe({
      next: ({success,data,message}) =>{
        if(!success)
          {
            alert(message);
            return this.getToDosFromLocal();
          }
          this.todoList.set(data ?? [])
      },
      error: () =>{
        alert("unable to reach server");
        this.getToDosFromLocal()
      }
    })
  }
  
  getStatusesFromServer() {

  this.http.get<ServiceResponse<ToDoStatusModel[]>>(
    'https://localhost:7036/api/status'
  ).subscribe({

    next: (res) => {
      this.statuses.set(res.data);
    },

    error: (err) => {
      console.log(err);
    }

  });

}

  filteredTodos = computed(() => {
    const status = this.selectedStatus();
    const list = this.todoList();

    if(status === null){
      return list;
    }
    return list.filter(l => l.statusId === status)
  });

  setFilter(statusId: number | null): void {
  this.selectedStatus.set(statusId);
}


  onSaveNewTask() {
    if(!this.task.title?.trim() || !this.task.description?.trim()){
      alert("Please fill in Task title and description before clicking add");
    }
    else{
      debugger;
      this.http.post<ServiceResponse<TodoModel>>('https://localhost:7036/api/ToDo',this.task).
      subscribe({
        next: ({success,message}) =>{
          if(!success)
            {
              alert(message);
              return;
            }
          this.getTodosFromServer();
          this.resetTask();
        },
        error: (err)=>{
          console.error(err);
          //alert("Server unavailable. Saving Locally.")
          //this.saveTaskLocally();
        }
      });     
    }
  }

  private saveTaskLocally() {
    this.generateUniqueId();
    const taskToAdd = { ...this.task };
    this.todoList.update(list => [taskToAdd, ...list]);
    this.updateLocalStorage();
    this.resetTask();
  }

  onEditTask(item: TodoModel){
    const cloneData = structuredClone(item);
    this.task = cloneData;
  }

  onUpdateTask(){
    if (!this.task.title?.trim() || !this.task.description?.trim()) 
    {
      alert("Please fill in Task title and description.");
      return;
    }
    this.http.put<ServiceResponse<TodoModel>>('https://localhost:7036/api/ToDo',this.task).
    subscribe({
      next: ({success, message,data}) =>{
        if(!success)
        {
          alert(message);
          return;
        }
        
        this.todoList.update(list => list.map(item =>
          item.itemId === data.itemId ? data : item
        ));
      },
     error :(error : string) =>{
          console.log(error)
          this.updateTaskLocally();
      }
    });   
    this.resetTask();
  }

  private updateTaskLocally() {
    const updateRecord = this.todoList().find(r => r.itemId == this.task.itemId);
    if (updateRecord != null) {
      updateRecord.title = this.task.title;
      updateRecord.description = this.task.description;
      updateRecord.statusId = this.task.statusId;
      this.updateLocalStorage();
    }
  }

cancelUpdate(){
  this.resetTask();
}

onDeleteTask(id: number): void {
  const confirmDelete = confirm("Are you want to delete this record?");
  if(confirmDelete){
    this.http.delete(`https://localhost:7036/api/ToDo/${id}`).
    subscribe({
      next: () =>{
        this.getTodosFromServer();
      },
      error: (error: string) =>{
        alert(JSON.stringify(error));
        this.deleteTaskFromLocal(id); 
      }    
    });   
  }  
}

private deleteTaskFromLocal(id: number) {
    const record = this.todoList().find(rec => rec.itemId = id);
    if (record != null) {
      this.todoList.update(list => list.filter(t => t.itemId !== id));
      this.updateLocalStorage();
    }
  }

  onViewPendingTasksOnly(){
    return
  }

  generateUniqueId() {
    const lastIndex: string = (this.todoList.length + 1).toString();
    const date = new Date();
    const dayNumber: string = date.getDay().toString();
    const millisecs: string = date.getMilliseconds().toString();
    const id: string = lastIndex + dayNumber + millisecs;
    this.task.itemId = parseInt(id);
  }
  
  updateLocalStorage(){
    localStorage.setItem(this.localStorageKey, JSON.stringify(this.todoList()));
  }

  resetTask(){
    this.task = {
    itemId: 0,
    title: '',
    description: '',
    statusId: 1,
    eventId: 1
    };
  }


  getStatusClass(statusId: number): string{
    const status = this.getStatusName(statusId)
    switch(status){
      case 'Pending':
        return 'badge-pending';
      
      case 'In Progress':
        return 'badge-progress';

      case 'Done':
        return 'badge-done';

        default:
      return 'badge-default';
    }
  }

 getStatusName(statusId: number): string{
    const status = this.statuses().find(s => s.statusId === statusId);
    return status ? status.statusName : 'Unknown';
  }

}

