import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';

import {
  CandidateService,
  CandidateData,
} from '../../services/candidate';

@Component({
  selector: 'app-add-candidate',
  imports: [CommonModule, FormsModule],
  templateUrl: './add-candidate.html',
  styleUrl: './add-candidate.css',
})
export class AddCandidate {

  candidate = {
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    position: '',
    experience: '',
    location: '',
    status: 'Applied',
    skills: '',
    education: '',
    linkedin: '',
    portfolio: '',
    notes: '',
  };

  isSaving = false;

  constructor(
    private router: Router,
    private candidateService: CandidateService
  ) {}

  saveCandidate(): void {

    if (
      !this.candidate.firstName.trim() ||
      !this.candidate.lastName.trim() ||
      !this.candidate.email.trim() ||
      !this.candidate.position.trim()
    ) {
      alert('Please fill in all required fields.');
      return;
    }

    if (this.isSaving) {
      return;
    }

    const newCandidate: CandidateData = {
      id: Date.now(),

      name:
        `${this.candidate.firstName.trim()} ${this.candidate.lastName.trim()}`,

      email:
        this.candidate.email.trim(),

      phone:
        this.candidate.phone.trim(),

      position:
        this.candidate.position.trim(),

      experience:
        this.candidate.experience.trim(),

      status:
        this.candidate.status,

      appliedDate:
        new Date().toLocaleDateString(),
    };

    console.log(
      'Candidate being saved:',
      newCandidate
    );

    this.isSaving = true;

    // Save candidate to JSON Server
    this.candidateService
      .addCandidate(newCandidate)
      .subscribe({

        next: (addedCandidate) => {

          console.log(
            'Candidate added successfully:',
            addedCandidate
          );

          this.isSaving = false;

          alert(
            `${addedCandidate.name} has been added successfully!`
          );

          // Go to Candidates page after successful API response
          this.router.navigate([
            '/candidates',
          ]);
        },

        error: (error) => {

          console.error(
            'Error adding candidate:',
            error
          );

          this.isSaving = false;

          alert(
            'Unable to add candidate. Please try again.'
          );
        },

      });
  }

  cancel(): void {
    this.router.navigate([
      '/candidates',
    ]);
  }

}