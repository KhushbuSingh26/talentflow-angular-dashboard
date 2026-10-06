import { Component, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';

import {
  CandidateService,
  CandidateData,
} from '../../services/candidate';

import {
  ResumeParserService,
  ParsedCandidate,
} from '../../services/resume-parser.service';

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
  isParsingResume = false;

  resumeFileName = '';
  resumeParsedSuccessfully = false;
  resumeParseError = '';

  constructor(
    private router: Router,
    private candidateService: CandidateService,
    private resumeParserService: ResumeParserService,
    private cdr: ChangeDetectorRef
  ) {}

  onResumeSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];

    if (!file) {
      return;
    }

    const fileName = file.name.toLowerCase();

    const isPdf =
      file.type === 'application/pdf' ||
      fileName.endsWith('.pdf');

    const isDocx =
      file.type ===
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document' ||
      fileName.endsWith('.docx');

    if (!isPdf && !isDocx) {
      this.resumeParseError =
        'Please upload a PDF or DOCX resume.';
      this.resumeParsedSuccessfully = false;
      this.resumeFileName = '';

      input.value = '';

      this.cdr.detectChanges();
      return;
    }

    const maxFileSize = 10 * 1024 * 1024;

    if (file.size > maxFileSize) {
      this.resumeParseError =
        'Resume file must be smaller than 10 MB.';
      this.resumeParsedSuccessfully = false;
      this.resumeFileName = '';

      input.value = '';

      this.cdr.detectChanges();
      return;
    }

    this.resumeFileName = file.name;
    this.isParsingResume = true;
    this.resumeParsedSuccessfully = false;
    this.resumeParseError = '';

    this.cdr.detectChanges();

    console.log('Resume selected:', file.name);
    console.log('Starting resume parsing...');

    this.resumeParserService.parseResume(file).subscribe({
      next: (response) => {
        console.log('Resume parser response:', response);

        if (
          !response ||
          !response.success ||
          !response.candidate
        ) {
          this.isParsingResume = false;
          this.resumeParsedSuccessfully = false;

          this.resumeParseError =
            response?.message ||
            'Could not extract candidate information from the resume.';

          this.cdr.detectChanges();

          return;
        }

        this.applyParsedCandidate(response.candidate);

        this.isParsingResume = false;
        this.resumeParsedSuccessfully = true;
        this.resumeParseError = '';

        console.log(
          'Candidate form filled successfully:',
          this.candidate
        );

        this.cdr.detectChanges();
      },

      error: (error) => {
        console.error(
          'Resume parsing error:',
          error
        );

        this.isParsingResume = false;
        this.resumeParsedSuccessfully = false;

        this.resumeParseError =
          error?.error?.message ||
          'Unable to read the resume. Please make sure the Resume Parser API is running.';

        this.cdr.detectChanges();
      },

      complete: () => {
        console.log(
          'Resume parsing request completed.'
        );

        this.isParsingResume = false;

        this.cdr.detectChanges();
      },
    });
  }

  applyParsedCandidate(
    parsedCandidate: ParsedCandidate
  ): void {
    const fullName = (parsedCandidate.name || '')
      .trim()
      .replace(/\s+/g, ' ');

    /*
     * NAME
     */
    if (fullName) {
      const nameParts = fullName.split(' ');

      this.candidate.firstName =
        nameParts[0] || '';

      this.candidate.lastName =
        nameParts.length > 1
          ? nameParts.slice(1).join(' ')
          : '';
    } else {
      this.candidate.firstName = '';
      this.candidate.lastName = '';
    }

    /*
     * EMAIL
     */
    this.candidate.email =
      parsedCandidate.email || '';

    /*
     * PHONE
     */
    this.candidate.phone =
      parsedCandidate.phone || '';

    /*
     * POSITION
     */
    this.candidate.position =
      parsedCandidate.position || '';

    /*
     * EXPERIENCE
     *
     * Backend returns values such as:
     * "2 years"
     *
     * The form dropdown uses ranges such as:
     * "1-3 Years"
     */
    this.candidate.experience =
      this.normalizeExperience(
        parsedCandidate.experience
      );

    /*
     * LOCATION
     */
    this.candidate.location =
      parsedCandidate.location || '';

    /*
     * STATUS
     */
    this.candidate.status =
      parsedCandidate.status || 'Applied';

    /*
     * SKILLS
     */
    this.candidate.skills =
      parsedCandidate.skills || '';

    /*
     * EDUCATION
     */
    this.candidate.education =
      parsedCandidate.education || '';

    /*
     * LINKEDIN
     */
    this.candidate.linkedin =
      parsedCandidate.linkedin || '';

    /*
     * PORTFOLIO
     */
    this.candidate.portfolio =
      parsedCandidate.portfolio || '';

    /*
     * NOTES
     *
     * Backend extracts the Professional Summary
     * and places it in the notes field.
     */
    this.candidate.notes =
      parsedCandidate.notes || '';

    console.log(
      'Parsed candidate applied to form:',
      this.candidate
    );

    this.cdr.detectChanges();
  }

  normalizeExperience(
    experience: string
  ): string {
    const value = (experience || '')
      .toLowerCase()
      .trim();

    if (!value) {
      return '';
    }

    const match = value.match(
      /(\d+(?:\.\d+)?)/
    );

    if (!match) {
      return '';
    }

    const years = Number(match[1]);

    if (years <= 1) {
      return '0-1 Years';
    }

    if (years <= 3) {
      return '1-3 Years';
    }

    if (years <= 5) {
      return '3-5 Years';
    }

    if (years <= 8) {
      return '5-8 Years';
    }

    return '8+ Years';
  }

  resetResume(): void {
    this.isParsingResume = false;
    this.resumeFileName = '';
    this.resumeParsedSuccessfully = false;
    this.resumeParseError = '';

    this.cdr.detectChanges();
  }

  saveCandidate(): void {
    if (
      !this.candidate.firstName.trim() ||
      !this.candidate.lastName.trim() ||
      !this.candidate.email.trim() ||
      !this.candidate.position.trim()
    ) {
      alert(
        'Please fill in all required fields.'
      );
      return;
    }

    if (
      this.isSaving ||
      this.isParsingResume
    ) {
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

      location:
        this.candidate.location.trim(),

      status:
        this.candidate.status,

      skills:
        this.candidate.skills.trim(),

      education:
        this.candidate.education.trim(),

      linkedin:
        this.candidate.linkedin.trim(),

      portfolio:
        this.candidate.portfolio.trim(),

      notes:
        this.candidate.notes.trim(),

      appliedDate:
        new Date().toLocaleDateString(),
    };

    console.log(
      'Candidate being saved:',
      newCandidate
    );

    this.isSaving = true;

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

          this.cdr.detectChanges();
        },
      });
  }

  cancel(): void {
    this.router.navigate([
      '/candidates',
    ]);
  }
}