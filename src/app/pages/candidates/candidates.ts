import {
  Component,
  OnInit,
  ChangeDetectorRef,
} from '@angular/core';

import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import {
  CandidateService,
  CandidateData,
} from '../../services/candidate';

import {
  JobService,
  JobData,
} from '../../services/job.service';

interface Candidate extends Omit<CandidateData, 'jobId'> {
  appliedDate: string;
  jobId: string | number | null;
}

@Component({
  selector: 'app-candidates',

  imports: [
    CommonModule,
    FormsModule,
  ],

  templateUrl: './candidates.html',

  styleUrl: './candidates.css',
})
export class Candidates implements OnInit {

  candidates: Candidate[] = [];

  jobs: JobData[] = [];

  searchTerm = '';

  selectedStatus = 'All Status';

  showAddModal = false;

  showEditModal = false;

  isAddingCandidate = false;

  editingCandidate: Candidate | null = null;

  newCandidate = {
    name: '',
    email: '',
    position: '',
    jobId: null as string | number | null,
    status: 'Applied',
  };

  constructor(
    private candidateService: CandidateService,
    private jobService: JobService,
    private cdr: ChangeDetectorRef
  ) {}

  // ==============================
  // ANGULAR INITIALIZATION
  // ==============================

  ngOnInit(): void {
    this.loadJobs();
    this.loadCandidates();
  }

  // ==============================
  // LOAD JOBS
  // ==============================

  loadJobs(): void {
    this.jobService.getJobs().subscribe({
      next: (jobs) => {
        this.jobs = jobs || [];

        this.cdr.detectChanges();
      },

      error: () => {
        this.jobs = [];

        this.cdr.detectChanges();
      },
    });
  }

  // ==============================
  // LOAD CANDIDATES
  // ==============================

  loadCandidates(): void {
    this.candidateService.getCandidates().subscribe({
      next: (candidates) => {
        this.candidates = (candidates || []).map(
          (candidate: CandidateData) => ({
            ...candidate,

            appliedDate:
              candidate.appliedDate ||
              new Date().toLocaleDateString(),

            jobId:
              candidate.jobId ?? null,
          })
        );

        this.cdr.detectChanges();
      },

      error: () => {
        this.candidates = [];

        this.cdr.detectChanges();
      },
    });
  }

  // ==============================
  // SEARCH + FILTER
  // ==============================

  get filteredCandidates(): Candidate[] {
    const search =
      this.searchTerm
        .toLowerCase()
        .trim();

    return this.candidates.filter(
      (candidate) => {
        const name =
          candidate.name || '';

        const email =
          candidate.email || '';

        const position =
          candidate.position || '';

        const matchesSearch =
          name
            .toLowerCase()
            .includes(search) ||

          email
            .toLowerCase()
            .includes(search) ||

          position
            .toLowerCase()
            .includes(search);

        const matchesStatus =
          this.selectedStatus ===
            'All Status' ||

          candidate.status ===
            this.selectedStatus;

        return (
          matchesSearch &&
          matchesStatus
        );
      }
    );
  }

  // ==============================
  // ADD CANDIDATE MODAL
  // ==============================

  openAddModal(): void {
    this.loadJobs();

    this.newCandidate = {
      name: '',
      email: '',
      position: '',
      jobId: null,
      status: 'Applied',
    };

    this.isAddingCandidate = false;

    this.showAddModal = true;

    this.cdr.detectChanges();
  }

  closeAddModal(): void {
    this.showAddModal = false;

    this.newCandidate = {
      name: '',
      email: '',
      position: '',
      jobId: null,
      status: 'Applied',
    };

    this.isAddingCandidate = false;

    this.cdr.detectChanges();
  }

  // ==============================
  // JOB SELECTED
  // ==============================

  onJobSelected(): void {
    const jobId =
      this.newCandidate.jobId;

    if (
      jobId === null ||
      jobId === undefined ||
      jobId === ''
    ) {
      this.newCandidate.position = '';
      return;
    }

    const selectedJob =
      this.jobs.find(
        (job) =>
          String(job.id) ===
          String(jobId)
      );

    if (selectedJob) {
      this.newCandidate.position =
        selectedJob.title;
    } else {
      this.newCandidate.position = '';
    }
  }

  // ==============================
  // ADD CANDIDATE
  // ==============================

  addCandidate(): void {
    if (this.isAddingCandidate) {
      return;
    }

    const name =
      this.newCandidate.name
        ?.trim() || '';

    const email =
      this.newCandidate.email
        ?.trim() || '';

    const jobId =
      this.newCandidate.jobId;

    if (
      !name ||
      !email ||
      jobId === null ||
      jobId === undefined ||
      jobId === ''
    ) {
      alert(
        'Please fill in all required fields.'
      );

      return;
    }

    const selectedJob =
      this.jobs.find(
        (job) =>
          String(job.id) ===
          String(jobId)
      );

    if (!selectedJob) {
      alert(
        'Please select a valid job.'
      );

      return;
    }

    const candidate: CandidateData = {
      id: Date.now(),

      name,

      email,

      phone: '',

      position:
        selectedJob.title,

      experience: '',

      status:
        this.newCandidate.status,

      appliedDate:
        new Date().toLocaleDateString(),

      jobId:
        selectedJob.id,
    };

    this.isAddingCandidate = true;

    this.candidateService
      .addCandidate(candidate)
      .subscribe({
        next: () => {
          this.loadCandidates();

          this.closeAddModal();

          this.isAddingCandidate = false;

          this.cdr.detectChanges();
        },

        error: () => {
          this.isAddingCandidate = false;

          alert(
            'Unable to add candidate. Please try again.'
          );

          this.cdr.detectChanges();
        },
      });
  }

  // ==============================
  // DELETE CANDIDATE
  // ==============================

  deleteCandidate(
    id: string | number
  ): void {
    if (
      id === null ||
      id === undefined ||
      id === ''
    ) {
      return;
    }

    const confirmed =
      confirm(
        'Are you sure you want to delete this candidate?'
      );

    if (!confirmed) {
      return;
    }

    this.candidateService
      .deleteCandidate(id)
      .subscribe({
        next: () => {
          this.candidates =
            this.candidates.filter(
              (candidate) =>
                String(candidate.id) !==
                String(id)
            );

          this.cdr.detectChanges();
        },

        error: () => {
          alert(
            'Unable to delete candidate. Please try again.'
          );
        },
      });
  }

  // ==============================
  // EDIT CANDIDATE MODAL
  // ==============================

  openEditModal(
    candidate: Candidate
  ): void {
    this.editingCandidate = {
      ...candidate,

      jobId:
        candidate.jobId ?? null,
    };

    this.showEditModal = true;

    this.cdr.detectChanges();
  }

  closeEditModal(): void {
    this.showEditModal = false;

    this.editingCandidate = null;

    this.cdr.detectChanges();
  }

  // ==============================
  // EDIT JOB SELECTED
  // ==============================

  onEditJobSelected(): void {
    if (!this.editingCandidate) {
      return;
    }

    const jobId =
      this.editingCandidate.jobId;

    if (
      jobId === null ||
      jobId === undefined ||
      jobId === ''
    ) {
      this.editingCandidate.position = '';
      return;
    }

    const selectedJob =
      this.jobs.find(
        (job) =>
          String(job.id) ===
          String(jobId)
      );

    if (selectedJob) {
      this.editingCandidate.position =
        selectedJob.title;
    } else {
      this.editingCandidate.position = '';
    }
  }

  // ==============================
  // UPDATE CANDIDATE
  // ==============================

  updateCandidate(): void {
    if (!this.editingCandidate) {
      return;
    }

    const name =
      this.editingCandidate.name
        ?.trim() || '';

    const email =
      this.editingCandidate.email
        ?.trim() || '';

    const jobId =
      this.editingCandidate.jobId;

    if (
      !name ||
      !email ||
      jobId === null ||
      jobId === undefined ||
      jobId === ''
    ) {
      alert(
        'Please fill in all required fields.'
      );

      return;
    }

    const selectedJob =
      this.jobs.find(
        (job) =>
          String(job.id) ===
          String(jobId)
      );

    if (!selectedJob) {
      alert(
        'Please select a valid job.'
      );

      return;
    }

    const updatedCandidate:
      CandidateData = {
      id:
        this.editingCandidate.id,

      name,

      email,

      phone:
        this.editingCandidate.phone || '',

      position:
        selectedJob.title,

      experience:
        this.editingCandidate.experience || '',

      status:
        this.editingCandidate.status,

      appliedDate:
        this.editingCandidate.appliedDate,

      jobId:
        selectedJob.id,
    };

    this.candidateService
      .updateCandidate(
        updatedCandidate
      )
      .subscribe({
        next: (updated) => {
          const index =
            this.candidates.findIndex(
              (candidate) =>
                String(candidate.id) ===
                String(updated.id)
            );

          if (index !== -1) {
            this.candidates[index] = {
              ...updated,

              appliedDate:
                updated.appliedDate ||
                new Date().toLocaleDateString(),

              jobId:
                updated.jobId ?? null,
            };
          }

          this.closeEditModal();

          this.cdr.detectChanges();
        },

        error: () => {
          alert(
            'Unable to update candidate. Please try again.'
          );
        },
      });
  }

  // ==============================
  // CONFIRM DELETE
  // ==============================

  confirmDelete(
    candidate: Candidate
  ): void {
    if (
      candidate.id === null ||
      candidate.id === undefined ||
      candidate.id === ''
    ) {
      return;
    }

    this.deleteCandidate(
      candidate.id
    );
  }
}