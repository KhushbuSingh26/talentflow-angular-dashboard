import { Component } from '@angular/core';

@Component({
  selector: 'app-header',
  imports: [],
  templateUrl: './header.html',
  styleUrl: './header.css',
})
export class Header {

  isDarkMode = true;

  constructor() {
    const savedTheme = localStorage.getItem('theme');

    if (savedTheme === 'light') {
      this.isDarkMode = false;
    } else {
      this.isDarkMode = true;
    }

    this.applyTheme();
  }

  toggleTheme(): void {
    this.isDarkMode = !this.isDarkMode;

    this.applyTheme();

    localStorage.setItem(
      'theme',
      this.isDarkMode ? 'dark' : 'light'
    );
  }

  private applyTheme(): void {
    document.body.classList.remove(
      'light-theme',
      'dark-theme'
    );

    document.body.classList.add(
      this.isDarkMode
        ? 'dark-theme'
        : 'light-theme'
    );
  }
}