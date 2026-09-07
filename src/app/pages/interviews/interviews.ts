import {
  Component,
  OnInit,
  ChangeDetectorRef,
} from '@angular/core';

import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import {
  InterviewService,
  InterviewData,
} from '../../services/interview.service';

import {
  CandidateService,
  CandidateData,
} from '../../services/candidate';

interface Interview extends InterviewData {}

@Component({
  selector: 'app-interviews',

  imports: [
    CommonModule,
    FormsModule,
  ],

  templateUrl: './interviews.html',

  styleUrl: './interviews.css',
})
export class Interviews implements OnInit {

  interviews: Interview[] = [];

  candidates: CandidateData[] = [];

  searchTerm = '';

  selectedStatus = 'All Status';

  showAddModal = false;

  showEditModal = false;

  editingInterview: Interview | null = null;

  isAddingInterview = false;

  isUpdatingInterview = false;

  newInterview = {
    candidate: '',
    position: '',
    interviewer: '',
    date: '',
    time: '',
    type: 'Video',
    status: 'Scheduled',
  };

  constructor(
    private interviewService: InterviewService,
    private candidateService: CandidateService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.loadCandidates();
    this.loadInterviews();
  }

  // ==============================
  // Load Candidates
  // ==============================

  loadCandidates(): void {

    this.candidateService.getCandidates().subscribe({

      next: (candidates) => {

        this.candidates = candidates || [];

        this.cdr.detectChanges();

      },

      error: () => {

        this.candidates = [];

        this.cdr.detectChanges();

      },

    });

  }

  // ==============================
  // Load Interviews
  // ==============================

  loadInterviews(): void {

    this.interviewService.getInterviews().subscribe({

      next: (interviews) => {

        this.interviews = interviews || [];

        this.cdr.detectChanges();

      },

      error: () => {

        this.interviews = [];

        this.cdr.detectChanges();

      },

    });

  }

  // ==============================
  // Search + Status Filter
  // ==============================

  get filteredInterviews(): Interview[] {

    const search =
      this.searchTerm
        .toLowerCase()
        .trim();

    return this.interviews.filter(
      (interview) => {

        const candidate =
          interview.candidate || '';

        const position =
          interview.position || '';

        const interviewer =
          interview.interviewer || '';

        const matchesSearch =

          candidate
            .toLowerCase()
            .includes(search)

          ||

          position
            .toLowerCase()
            .includes(search)

          ||

          interviewer
            .toLowerCase()
            .includes(search);

        const matchesStatus =

          this.selectedStatus ===
            'All Status'

          ||

          interview.status ===
            this.selectedStatus;

        return (
          matchesSearch &&
          matchesStatus
        );

      }
    );

  }

  // ==============================
  // Add Interview Modal
  // ==============================

  openAddModal(): void {

    this.loadCandidates();

    this.newInterview = {

      candidate: '',

      position: '',

      interviewer: '',

      date: '',

      time: '',

      type: 'Video',

      status: 'Scheduled',

    };

    this.isAddingInterview = false;

    this.showAddModal = true;

    this.cdr.detectChanges();

  }

  closeAddModal(): void {

    this.showAddModal = false;

    this.newInterview = {

      candidate: '',

      position: '',

      interviewer: '',

      date: '',

      time: '',

      type: 'Video',

      status: 'Scheduled',

    };

    this.isAddingInterview = false;

    this.cdr.detectChanges();

  }

  // ==============================
  // Candidate Selected
  // ==============================

  onCandidateSelected(): void {

    if (!this.newInterview.candidate) {

      this.newInterview.position = '';

      return;

    }

    const selectedCandidate =
      this.candidates.find(
        (candidate) =>
          candidate.name ===
          this.newInterview.candidate
      );

    if (selectedCandidate) {

      this.newInterview.position =
        selectedCandidate.position;

    } else {

      this.newInterview.position = '';

    }

  }

  // ==============================
  // Add Interview
  // ==============================

  addInterview(): void {

    if (this.isAddingInterview) {
      return;
    }

    const candidate =
      this.newInterview.candidate.trim();

    const position =
      this.newInterview.position.trim();

    const interviewer =
      this.newInterview.interviewer.trim();

    const date =
      this.newInterview.date;

    const time =
      this.newInterview.time;

    if (
      !candidate ||
      !position ||
      !interviewer ||
      !date ||
      !time
    ) {

      alert(
        'Please fill in all required fields.'
      );

      return;

    }

    const interview: InterviewData = {

      id: Date.now(),

      candidate,

      position,

      interviewer,

      date:
        this.formatDate(date),

      time:
        this.formatTime(time),

      type:
        this.newInterview.type,

      status:
        this.newInterview.status,

    };

    this.isAddingInterview = true;

    this.interviewService
      .addInterview(interview)
      .subscribe({

        next: (addedInterview) => {

          this.interviews = [
            addedInterview,
            ...this.interviews,
          ];

          this.closeAddModal();

          this.cdr.detectChanges();

        },

        error: () => {

          this.isAddingInterview = false;

          alert(
            'Unable to add interview. Please try again.'
          );

          this.cdr.detectChanges();

        },

      });

  }

  // ==============================
  // Edit Interview
  // ==============================

  openEditModal(
    interview: Interview
  ): void {

    this.editingInterview = {

      ...interview,

      date:
        this.convertToInputDate(
          interview.date
        ),

      time:
        this.convertToInputTime(
          interview.time
        ),

    };

    this.isUpdatingInterview = false;

    this.showEditModal = true;

    this.cdr.detectChanges();

  }

  closeEditModal(): void {

    this.showEditModal = false;

    this.editingInterview = null;

    this.isUpdatingInterview = false;

    this.cdr.detectChanges();

  }

  // ==============================
  // Update Interview
  // ==============================

  updateInterview(): void {

    if (
      !this.editingInterview ||
      this.isUpdatingInterview
    ) {

      return;

    }

    const candidate =
      this.editingInterview.candidate.trim();

    const position =
      this.editingInterview.position.trim();

    const interviewer =
      this.editingInterview.interviewer.trim();

    const date =
      this.editingInterview.date;

    const time =
      this.editingInterview.time;

    if (
      !candidate ||
      !position ||
      !interviewer ||
      !date ||
      !time
    ) {

      alert(
        'Please fill in all required fields.'
      );

      return;

    }

    const updatedInterview: InterviewData = {

      ...this.editingInterview,

      candidate,

      position,

      interviewer,

      date:
        this.formatDate(date),

      time:
        this.formatTime(time),

    };

    this.isUpdatingInterview = true;

    this.interviewService
      .updateInterview(updatedInterview)
      .subscribe({

        next: (updated) => {

          const index =
            this.interviews.findIndex(
              (interview) =>
                String(interview.id) ===
                String(updated.id)
            );

          if (index !== -1) {

            this.interviews[index] =
              updated;

          }

          this.closeEditModal();

          this.cdr.detectChanges();

        },

        error: () => {

          this.isUpdatingInterview = false;

          alert(
            'Unable to update interview. Please try again.'
          );

          this.cdr.detectChanges();

        },

      });

  }

  // ==============================
  // Delete Interview
  // ==============================

  deleteInterview(
    id: number | string
  ): void {

    const interview =
      this.interviews.find(
        (item) =>
          String(item.id) ===
          String(id)
      );

    const candidateName =
      interview?.candidate ||
      'this interview';

    const confirmed =
      confirm(
        `Are you sure you want to delete the interview for ${candidateName}?`
      );

    if (!confirmed) {

      return;

    }

    this.interviewService
      .deleteInterview(id)
      .subscribe({

        next: () => {

          this.interviews =
            this.interviews.filter(
              (item) =>
                String(item.id) !==
                String(id)
            );

          this.cdr.detectChanges();

        },

        error: () => {

          alert(
            'Unable to delete interview. Please try again.'
          );

        },

      });

  }

  // ==============================
  // Format Date
  // ==============================

  formatDate(
    date: string
  ): string {

    if (!date) {
      return '';
    }

    const parts =
      date.split('-');

    if (parts.length !== 3) {
      return date;
    }

    const year =
      Number(parts[0]);

    const month =
      Number(parts[1]);

    const day =
      Number(parts[2]);

    if (
      !year ||
      !month ||
      !day
    ) {

      return date;

    }

    const dateObject =
      new Date(
        year,
        month - 1,
        day
      );

    return dateObject.toLocaleDateString(
      'en-US',
      {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      }
    );

  }

  // ==============================
  // Format Time
  // ==============================

  formatTime(
    time: string
  ): string {

    if (!time) {
      return '';
    }

    const parts =
      time.split(':');

    if (parts.length < 2) {
      return time;
    }

    let hour =
      Number(parts[0]);

    const minutes =
      parts[1];

    if (
      Number.isNaN(hour) ||
      !minutes
    ) {

      return time;

    }

    const ampm =
      hour >= 12
        ? 'PM'
        : 'AM';

    hour =
      hour % 12 || 12;

    return `${hour}:${minutes} ${ampm}`;

  }

  // ==============================
  // Convert Saved Date
  // To Date Input Format
  // ==============================

  convertToInputDate(
    date: string
  ): string {

    if (!date) {
      return '';
    }

    if (
      /^\d{4}-\d{2}-\d{2}$/.test(date)
    ) {

      return date;

    }

    const dateObject =
      new Date(date);

    if (
      Number.isNaN(
        dateObject.getTime()
      )
    ) {

      return '';

    }

    const year =
      dateObject.getFullYear();

    const month =
      String(
        dateObject.getMonth() + 1
      ).padStart(2, '0');

    const day =
      String(
        dateObject.getDate()
      ).padStart(2, '0');

    return `${year}-${month}-${day}`;

  }

  // ==============================
  // Convert Saved Time
  // To Time Input Format
  // ==============================

  convertToInputTime(
    time: string
  ): string {

    if (!time) {
      return '';
    }

    if (
      /^\d{2}:\d{2}$/.test(time)
    ) {

      return time;

    }

    const match =
      time
        .trim()
        .match(
          /^(\d{1,2}):(\d{2})\s*(AM|PM)$/i
        );

    if (!match) {

      return '';

    }

    let hour =
      Number(match[1]);

    const minutes =
      match[2];

    const period =
      match[3].toUpperCase();

    if (
      hour < 1 ||
      hour > 12
    ) {

      return '';

    }

    if (period === 'AM') {

      if (hour === 12) {

        hour = 0;

      }

    } else {

      if (hour !== 12) {

        hour += 12;

      }

    }

    return `${String(hour).padStart(2, '0')}:${minutes}`;

  }

}