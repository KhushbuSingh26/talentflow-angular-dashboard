import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-settings',
  imports: [CommonModule, FormsModule],
  styleUrl: './settings.css',
  templateUrl: './settings.html',
})
export class Settings {

  profile = {
    name: 'Khushbu Singh',
    email: 'khushbu@example.com',
    role: 'Administrator',
  };

  company = {
    name: 'TalentHire',
    location: 'New Delhi, India',
    website: 'www.talenthire.com',
  };

  notifications = {
    emailNotifications: true,
    interviewReminders: true,
    newApplications: true,
    weeklyReports: false,
  };

  security = {
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  };

  saveProfile(): void {
    alert('Profile settings saved successfully!');
  }

  saveCompany(): void {
    alert('Company settings saved successfully!');
  }

  saveNotifications(): void {
    alert('Notification settings saved successfully!');
  }

  changePassword(): void {
    if (
      !this.security.currentPassword ||
      !this.security.newPassword ||
      !this.security.confirmPassword
    ) {
      alert('Please fill in all password fields.');
      return;
    }

    if (this.security.newPassword !== this.security.confirmPassword) {
      alert('New password and confirm password do not match.');
      return;
    }

    alert('Password changed successfully!');

    this.security = {
      currentPassword: '',
      newPassword: '',
      confirmPassword: '',
    };
  }
}