import {
  Component,
  input,
  OnDestroy,
  OnInit,
  output,
  signal,
} from '@angular/core';
import { User } from 'backend';

@Component({
  selector: 'app-header-selector',
  template: `
    <div class="relative menu">
      <button
        class="flex items-center space-x-2 cursor-pointer p-2"
        (click)="showMenu.set(!showMenu())"
      >
        <div
          class="rounded-full bg-p p-2 bg-indigo-600 flex justify-center items-center"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="currentColor"
            class="fill-white"
          >
            <path stroke="none" d="M0 0h24v24H0z" fill="none" />
            <path d="M12 2a5 5 0 1 1 -5 5l.005 -.217a5 5 0 0 1 4.995 -4.783z" />
            <path
              d="M14 14a5 5 0 0 1 5 5v1a2 2 0 0 1 -2 2h-10a2 2 0 0 1 -2 -2v-1a5 5 0 0 1 5 -5h4z"
            />
          </svg>
        </div>
        <span>{{ currentUser()?.name }}</span>
      </button>

      <div
        class="absolute w-32 top-[calc(100%+10px)] right-0 border bg-white shadow-lg rounded-md space-y-2"
        [class.hidden]="!showMenu()"
      >
        <div class="flex flex-col">
          @for(user of users(); track user.id) {
          <div
            class="[&:not(:last-child)]:border-b px-4 py-2 cursor-pointer"
            (click)="emitUser(user)"
          >
            <span>{{ user.name }}</span>
          </div>
          }

          <div
            class="px-4 py-2 flex items-center space-x-2 justify-between cursor-pointer"
            (click)="logout.emit(); showMenu.set(false)"
          >
            <small>Salir</small>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
              class="icon icon-tabler icons-tabler-outline icon-tabler-logout"
            >
              <path stroke="none" d="M0 0h24v24H0z" fill="none" />
              <path
                d="M14 8v-2a2 2 0 0 0 -2 -2h-7a2 2 0 0 0 -2 2v12a2 2 0 0 0 2 2h7a2 2 0 0 0 2 -2v-2"
              />
              <path d="M9 12h12l-3 -3" />
              <path d="M18 15l3 -3" />
            </svg>
          </div>
        </div>
      </div>
    </div>
  `,
})
export default class HeaderSelector implements OnInit, OnDestroy {
  showMenu = signal(false);

  users = input.required<User[]>();

  userChanged = output<User>();

  currentUser = input<User | null>();

  logout = output();

  private closeMenu = (event: MouseEvent) => {
    if (!(event.target as HTMLElement).closest('.menu')) {
      this.showMenu.set(false);
    }
  };

  ngOnInit() {
    document.addEventListener('click', this.closeMenu);
  }

  emitUser(user: User) {
    this.userChanged.emit(user);
    this.showMenu.set(false);
  }

  ngOnDestroy(): void {
    document.removeEventListener('click', this.closeMenu);
    this.showMenu.set(false);
  }
}
