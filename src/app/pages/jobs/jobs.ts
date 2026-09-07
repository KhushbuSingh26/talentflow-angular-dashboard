import {
  Component,
  OnInit,
  ChangeDetectorRef,
} from '@angular/core';

import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import {
  JobService,
  JobData,
} from '../../services/job.service';

import {
  CandidateService,
  CandidateData,
} from '../../services/candidate';

@Component({
  selector: 'app-jobs',

  imports: [
    CommonModule,
    FormsModule,
  ],

  templateUrl: './jobs.html',

  styleUrl: './jobs.css',
})
export class Jobs implements OnInit {

  jobs: JobData[] = [];

  candidates: CandidateData[] = [];

  searchTerm = '';

  selectedStatus = 'All Status';

  showAddModal = false;

  showEditModal = false;

  editingJob: JobData | null = null;

  newJob = {

    title: '',

    department: '',

    location: '',

    type: 'Full Time',

    status: 'Open',

  };

  defaultJobs: JobData[] = [

    {
      id: 1,
      title: 'Frontend Developer',
      department: 'Engineering',
      location: 'New Delhi, India',
      type: 'Full Time',
      status: 'Open',
      applicants: 0,
    },

    {
      id: 2,
      title: 'UI/UX Designer',
      department: 'Design',
      location: 'Remote',
      type: 'Full Time',
      status: 'Open',
      applicants: 0,
    },

    {
      id: 3,
      title: 'Angular Developer',
      department: 'Engineering',
      location: 'Bangalore, India',
      type: 'Full Time',
      status: 'Open',
      applicants: 0,
    },

    {
      id: 4,
      title: 'Backend Developer',
      department: 'Engineering',
      location: 'Mumbai, India',
      type: 'Full Time',
      status: 'Closed',
      applicants: 0,
    },

    {
      id: 5,
      title: 'HR Executive',
      department: 'Human Resources',
      location: 'Gurgaon, India',
      type: 'Full Time',
      status: 'Draft',
      applicants: 0,
    },

  ];

  constructor(

    private jobService: JobService,

    private candidateService: CandidateService,

    private cdr: ChangeDetectorRef

  ) {}

  // ==============================
  // ANGULAR INITIALIZATION
  // ==============================

  ngOnInit(): void {

    this.loadJobs();

  }

  // ==============================
  // GET JOBS FROM API
  // ==============================

  loadJobs(): void {

    this.jobService
      .getJobs()
      .subscribe({

        next: (jobs) => {

          if (
            !jobs ||
            jobs.length === 0
          ) {

            this.addDefaultJobs();

            return;

          }

          this.jobs = [...jobs];

          this.cdr.detectChanges();

          this.loadCandidates();

        },

        error: () => {

          this.jobs = [];

          this.cdr.detectChanges();

        },

      });

  }

  // ==============================
  // ADD DEFAULT JOBS
  // ==============================

  addDefaultJobs(): void {

    const requests =
      this.defaultJobs.map(
        (job) =>
          this.jobService.addJob(job)
      );

    if (
      requests.length === 0
    ) {

      this.jobs = [];

      this.cdr.detectChanges();

      return;

    }

    Promise.all(
      requests.map(
        request =>
          request.toPromise()
      )
    )
      .then(
        (addedJobs) => {

          this.jobs =
            addedJobs.filter(
              (
                job
              ): job is JobData =>
                !!job
            );

          this.cdr.detectChanges();

          this.loadCandidates();

        }
      )
      .catch(
        () => {

          this.jobs = [];

          this.cdr.detectChanges();

        }
      );

  }

  // ==============================
  // LOAD CANDIDATES
  // ==============================

  loadCandidates(): void {

    this.candidateService
      .getCandidates()
      .subscribe({

        next: (candidates) => {

          this.candidates =
            candidates || [];

          this.updateApplicantCounts();

        },

        error: () => {

          this.candidates = [];

          this.updateApplicantCounts();

        },

      });

  }

  // ==============================
  // CHECK CANDIDATE AGAINST JOB
  // ==============================

  isCandidateForJob(
    candidate: CandidateData,
    job: JobData
  ): boolean {

    /*
     * First preference:
     * Match using jobId when available.
     */

    if (
      candidate.jobId !== null &&
      candidate.jobId !== undefined &&
      candidate.jobId !== ''
    ) {

      return (
        String(candidate.jobId) ===
        String(job.id)
      );

    }

    /*
     * Fallback:
     * Match using candidate position
     * and job title.
     */

    const candidatePosition =
      (candidate.position || '')
        .toLowerCase()
        .trim();

    const jobTitle =
      (job.title || '')
        .toLowerCase()
        .trim();

    if (
      !candidatePosition ||
      !jobTitle
    ) {

      return false;

    }

    return (
      candidatePosition ===
      jobTitle
    );

  }

  // ==============================
  // GET APPLICANT COUNT
  // ==============================

  getApplicantCount(
    job: JobData
  ): number {

    return this.candidates.filter(
      candidate =>
        this.isCandidateForJob(
          candidate,
          job
        )
    ).length;

  }

  // ==============================
  // UPDATE APPLICANT COUNTS
  // ==============================

  updateApplicantCounts(): void {

    if (
      !this.jobs.length
    ) {

      this.cdr.detectChanges();

      return;

    }

    this.jobs =
      this.jobs.map(
        job => {

          const applicantCount =
            this.getApplicantCount(
              job
            );

          return {

            ...job,

            applicants:
              applicantCount,

          };

        }
      );

    this.cdr.detectChanges();

  }

  // ==============================
  // SEARCH + FILTER
  // ==============================

  get filteredJobs(): JobData[] {

    const search =
      this.searchTerm
        .toLowerCase()
        .trim();

    return this.jobs.filter(
      job => {

        const title =
          job.title || '';

        const department =
          job.department || '';

        const location =
          job.location || '';

        const matchesSearch =

          title
            .toLowerCase()
            .includes(search)

          ||

          department
            .toLowerCase()
            .includes(search)

          ||

          location
            .toLowerCase()
            .includes(search);

        const matchesStatus =

          this.selectedStatus ===
            'All Status'

          ||

          job.status ===
            this.selectedStatus;

        return (
          matchesSearch &&
          matchesStatus
        );

      }
    );

  }

  // ==============================
  // ADD JOB MODAL
  // ==============================

  openAddModal(): void {

    this.newJob = {

      title: '',

      department: '',

      location: '',

      type: 'Full Time',

      status: 'Open',

    };

    this.showAddModal = true;

    this.cdr.detectChanges();

  }

  closeAddModal(): void {

    this.showAddModal = false;

    this.newJob = {

      title: '',

      department: '',

      location: '',

      type: 'Full Time',

      status: 'Open',

    };

    this.cdr.detectChanges();

  }

  // ==============================
  // POST - ADD JOB
  // ==============================

  addJob(): void {

    const title =
      this.newJob.title
        .trim();

    const department =
      this.newJob.department
        .trim();

    const location =
      this.newJob.location
        .trim();

    if (
      !title ||
      !department ||
      !location
    ) {

      alert(
        'Please fill in all required fields.'
      );

      return;

    }

    const job: JobData = {

      id: Date.now(),

      title,

      department,

      location,

      type:
        this.newJob.type,

      status:
        this.newJob.status,

      applicants: 0,

    };

    /*
     * Show immediately in UI.
     */

    this.jobs = [
      job,
      ...this.jobs,
    ];

    this.closeAddModal();

    this.cdr.detectChanges();

    /*
     * Save to API.
     */

    this.jobService
      .addJob(job)
      .subscribe({

        next: (addedJob) => {

          this.jobs =
            this.jobs.map(
              item =>
                String(item.id) ===
                String(job.id)
                  ? {
                      ...addedJob,
                      applicants:
                        this.getApplicantCount(
                          addedJob
                        ),
                    }
                  : item
            );

          this.cdr.detectChanges();

        },

        error: () => {

          this.jobs =
            this.jobs.filter(
              item =>
                String(item.id) !==
                String(job.id)
            );

          this.cdr.detectChanges();

          alert(
            'Unable to add job. Please try again.'
          );

        },

      });

  }

  // ==============================
  // DELETE JOB
  // ==============================

  deleteJob(
    id: string | number
  ): void {

    const job =
      this.jobs.find(
        item =>
          String(item.id) ===
          String(id)
      );

    const confirmed =
      confirm(
        `Are you sure you want to delete ${
          job?.title || 'this job'
        }?`
      );

    if (!confirmed) {

      return;

    }

    this.jobService
      .deleteJob(id)
      .subscribe({

        next: () => {

          this.jobs =
            this.jobs.filter(
              item =>
                String(item.id) !==
                String(id)
            );

          this.cdr.detectChanges();

        },

        error: () => {

          alert(
            'Unable to delete job. Please try again.'
          );

        },

      });

  }

  // ==============================
  // EDIT JOB MODAL
  // ==============================

  openEditModal(
    job: JobData
  ): void {

    this.editingJob = {
      ...job,
    };

    this.showEditModal = true;

    this.cdr.detectChanges();

  }

  closeEditModal(): void {

    this.showEditModal = false;

    this.editingJob = null;

    this.cdr.detectChanges();

  }

  // ==============================
  // PUT - UPDATE JOB
  // ==============================

  updateJob(): void {

    if (
      !this.editingJob
    ) {

      return;

    }

    const title =
      this.editingJob.title
        ?.trim() || '';

    const department =
      this.editingJob.department
        ?.trim() || '';

    const location =
      this.editingJob.location
        ?.trim() || '';

    if (
      !title ||
      !department ||
      !location
    ) {

      alert(
        'Please fill in all required fields.'
      );

      return;

    }

    const updatedJob: JobData = {

      id:
        this.editingJob.id,

      title,

      department,

      location,

      type:
        this.editingJob.type,

      status:
        this.editingJob.status,

      applicants:
        this.getApplicantCount(
          this.editingJob
        ),

    };

    this.jobService
      .updateJob(updatedJob)
      .subscribe({

        next: (savedJob) => {

          this.jobs =
            this.jobs.map(
              job =>
                String(job.id) ===
                String(savedJob.id)
                  ? {
                      ...savedJob,
                      applicants:
                        this.getApplicantCount(
                          savedJob
                        ),
                    }
                  : job
            );

          this.closeEditModal();

          this.cdr.detectChanges();

        },

        error: () => {

          alert(
            'Unable to update job. Please try again.'
          );

        },

      });

  }

}