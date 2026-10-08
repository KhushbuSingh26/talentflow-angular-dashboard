import { Component } from '@angular/core';

@Component({
  selector: 'app-header',
  imports: [],
  templateUrl: './header.html',
  styleUrl: './header.css',
})
export class Header {

  constructor() {
    // Always use light theme
    document.body.classList.remove('dark-theme');
    document.body.classList.add('light-theme');

    // Remove old saved dark theme preference
    localStorage.removeItem('theme');
  }

}