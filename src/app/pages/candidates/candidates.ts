import {
  Component,
  OnInit,
  ChangeDetectorRef,
} from '@angular/core';

import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { finalize } from 'rxjs';

import {
  CandidateService,
  CandidateData,
} from '../../services/candidate';

import {
  JobService,
  JobData,
} from '../../services/job.service';

import {
  ResumeParserService,
  ParsedCandidate,
} from '../../services/resume-parser.service';


interface Candidate
  extends Omit<CandidateData, 'jobId' | 'appliedDate'> {

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

  // =====================================================
  // DATA
  // =====================================================

  candidates: Candidate[] = [];

  jobs: JobData[] = [];

  searchTerm = '';

  selectedStatus = 'All Status';


  // =====================================================
  // MODALS
  // =====================================================

  showAddModal = false;

  showEditModal = false;


  // =====================================================
  // LOADING
  // =====================================================

  isAddingCandidate = false;

  isParsingResume = false;


  // =====================================================
  // RESUME PARSER
  // =====================================================

  resumeFileName = '';

  resumeParsedSuccessfully = false;

  resumeParseError = '';


  // =====================================================
  // EDITING
  // =====================================================

  editingCandidate: Candidate | null = null;


  // =====================================================
  // NEW CANDIDATE
  // =====================================================

  newCandidate = {

    name: '',

    email: '',

    phone: '',

    experience: '',

    position: '',

    location: '',

    skills: '',

    education: '',

    linkedin: '',

    portfolio: '',

    notes: '',

    jobId: null as string | number | null,

    status: 'Applied',

  };


  // =====================================================
  // CONSTRUCTOR
  // =====================================================

  constructor(

    private candidateService: CandidateService,

    private jobService: JobService,

    private resumeParserService: ResumeParserService,

    private cdr: ChangeDetectorRef

  ) {}


  // =====================================================
  // INIT
  // =====================================================

  ngOnInit(): void {

    this.loadJobs();

    this.loadCandidates();

  }


  // =====================================================
  // LOAD JOBS
  // =====================================================

  loadJobs(): void {

    this.jobService
      .getJobs()
      .subscribe({

        next: (jobs) => {

          this.jobs = jobs || [];

          this.cdr.detectChanges();

        },

        error: (error) => {

          console.error(
            'Error loading jobs:',
            error
          );

          this.jobs = [];

          this.cdr.detectChanges();

        },

      });

  }


  // =====================================================
  // LOAD CANDIDATES
  // =====================================================

  loadCandidates(): void {

    this.candidateService
      .getCandidates()
      .subscribe({

        next: (candidates) => {

          this.candidates =
            (candidates || []).map(
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

        error: (error) => {

          console.error(
            'Error loading candidates:',
            error
          );

          this.candidates = [];

          this.cdr.detectChanges();

        },

      });

  }


  // =====================================================
  // FILTERED CANDIDATES
  // =====================================================

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
            .includes(search)

          ||

          email
            .toLowerCase()
            .includes(search)

          ||

          position
            .toLowerCase()
            .includes(search);


        const matchesStatus =

          this.selectedStatus ===
            'All Status'

          ||

          candidate.status ===
            this.selectedStatus;


        return (
          matchesSearch &&
          matchesStatus
        );

      }
    );

  }


  // =====================================================
  // OPEN ADD MODAL
  // =====================================================

  openAddModal(): void {

    this.loadJobs();


    this.newCandidate = {

      name: '',

      email: '',

      phone: '',

      experience: '',

      position: '',

      location: '',

      skills: '',

      education: '',

      linkedin: '',

      portfolio: '',

      notes: '',

      jobId: null,

      status: 'Applied',

    };


    this.resetResumeParserState();


    this.isAddingCandidate = false;

    this.showAddModal = true;


    this.cdr.detectChanges();

  }


  // =====================================================
  // CLOSE ADD MODAL
  // =====================================================

  closeAddModal(): void {

    this.showAddModal = false;


    this.newCandidate = {

      name: '',

      email: '',

      phone: '',

      experience: '',

      position: '',

      location: '',

      skills: '',

      education: '',

      linkedin: '',

      portfolio: '',

      notes: '',

      jobId: null,

      status: 'Applied',

    };


    this.isAddingCandidate = false;


    this.resetResumeParserState();


    this.cdr.detectChanges();

  }


  // =====================================================
  // RESET RESUME STATE
  // =====================================================

  resetResumeParserState(): void {

    this.isParsingResume = false;

    this.resumeFileName = '';

    this.resumeParsedSuccessfully = false;

    this.resumeParseError = '';

  }


  // =====================================================
  // RESUME SELECTED
  // =====================================================

  onResumeSelected(event: Event): void {

    const input =
      event.target as HTMLInputElement;

    const file =
      input.files?.[0];


    if (!file) {

      return;

    }


    // Allow selecting the same file again
    input.value = '';


    // ===================================================
    // ALLOWED FILE TYPES
    // ===================================================

    const allowedTypes = [

      'application/pdf',

      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',

    ];


    const maxSize =
      10 * 1024 * 1024;


    // ===================================================
    // FILE TYPE VALIDATION
    // ===================================================

    if (
      !allowedTypes.includes(
        file.type
      )
    ) {

      this.resumeParseError =
        'Please upload a PDF or DOCX file.';

      this.resumeParsedSuccessfully =
        false;

      this.isParsingResume =
        false;

      this.cdr.detectChanges();

      return;

    }


    // ===================================================
    // FILE SIZE VALIDATION
    // ===================================================

    if (
      file.size > maxSize
    ) {

      this.resumeParseError =
        'Resume size must be less than 10 MB.';

      this.resumeParsedSuccessfully =
        false;

      this.isParsingResume =
        false;

      this.cdr.detectChanges();

      return;

    }


    // ===================================================
    // START PARSING
    // ===================================================

    this.resumeFileName =
      file.name;

    this.resumeParseError = '';

    this.resumeParsedSuccessfully =
      false;

    this.isParsingResume =
      true;


    this.cdr.detectChanges();


    console.log(
      'Resume parsing started:',
      file.name
    );


    // ===================================================
    // API CALL
    // ===================================================

    this.resumeParserService

      .parseResume(file)

      .pipe(

        finalize(() => {

          console.log(
            'Resume parsing request finished'
          );


          // IMPORTANT:
          // Always remove Processing state

          this.isParsingResume =
            false;


          this.cdr.detectChanges();

        })

      )

      .subscribe({

        // =================================================
        // SUCCESS
        // =================================================

        next: (response) => {

          console.log(
            'Resume parser response:',
            response
          );


          if (
            response &&
            response.success &&
            response.candidate
          ) {

            try {

              this.applyParsedCandidate(
                response.candidate
              );


              this.resumeParsedSuccessfully =
                true;

              this.resumeParseError = '';


              console.log(
                'Resume data applied successfully'
              );


              this.cdr.detectChanges();

            }

            catch (error) {

              console.error(
                'Error applying candidate data:',
                error
              );


              this.resumeParsedSuccessfully =
                false;


              this.resumeParseError =
                'Resume was read successfully, but candidate details could not be filled automatically.';


              this.cdr.detectChanges();

            }

          }

          else {

            this.resumeParsedSuccessfully =
              false;


            this.resumeParseError =
              response?.message ||
              'Could not extract candidate information from the resume.';


            this.cdr.detectChanges();

          }

        },


        // =================================================
        // ERROR
        // =================================================

        error: (error) => {

          console.error(
            'Resume parser error:',
            error
          );


          this.resumeParsedSuccessfully =
            false;


          this.resumeParseError =

            error?.error?.message ||

            'Unable to process the resume. Please try again.';


          this.cdr.detectChanges();

        },

      });

  }


  // =====================================================
  // APPLY PARSED RESUME DATA
  // =====================================================

  applyParsedCandidate(
    candidate: ParsedCandidate
  ): void {

    console.log(
      'Applying parsed candidate:',
      candidate
    );


    // ===================================================
    // BASIC DETAILS
    // ===================================================

    this.newCandidate.name =
      candidate.name || '';


    this.newCandidate.email =
      candidate.email || '';


    this.newCandidate.phone =
      candidate.phone || '';


    this.newCandidate.experience =
      candidate.experience || '';


    // ===================================================
    // OTHER RESUME INFORMATION
    // ===================================================

    this.newCandidate.location =
      candidate.location || '';


    this.newCandidate.skills =
      candidate.skills || '';


    this.newCandidate.education =
      candidate.education || '';


    this.newCandidate.linkedin =
      candidate.linkedin || '';


    this.newCandidate.portfolio =
      candidate.portfolio || '';


    this.newCandidate.notes =
      candidate.notes || '';


    // ===================================================
    // STATUS
    // ===================================================

    this.newCandidate.status =
      candidate.status || 'Applied';


    // ===================================================
    // POSITION / JOB MATCH
    // ===================================================

    const parsedPosition =
      (
        candidate.position ||
        ''
      )
        .toLowerCase()
        .trim();


    if (parsedPosition) {

      const matchedJob =
        this.jobs.find(
          (job) => {

            const jobTitle =
              (
                job.title ||
                ''
              )
                .toLowerCase()
                .trim();


            return (

              jobTitle ===
                parsedPosition

              ||

              jobTitle.includes(
                parsedPosition
              )

              ||

              parsedPosition.includes(
                jobTitle
              )

            );

          }
        );


      if (matchedJob) {

        this.newCandidate.jobId =
          matchedJob.id;


        this.newCandidate.position =
          matchedJob.title;


        console.log(
          'Matching job found:',
          matchedJob.title
        );

      }

      else {

        this.newCandidate.position =
          candidate.position || '';

        this.newCandidate.jobId =
          null;


        console.log(
          'No matching job found:',
          candidate.position
        );

      }

    }

    else {

      this.newCandidate.position =
        '';

      this.newCandidate.jobId =
        null;

    }


    this.cdr.detectChanges();

  }


  // =====================================================
  // JOB SELECTED
  // =====================================================

  onJobSelected(): void {

    const jobId =
      this.newCandidate.jobId;


    if (

      jobId === null ||

      jobId === undefined ||

      jobId === ''

    ) {

      this.newCandidate.position =
        '';

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

    }

    else {

      this.newCandidate.position =
        '';

    }

  }


  // =====================================================
  // ADD CANDIDATE
  // =====================================================

  addCandidate(): void {

    if (
      this.isAddingCandidate
    ) {

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


    // ===================================================
    // VALIDATION
    // ===================================================

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


    // ===================================================
    // CREATE COMPLETE CANDIDATE
    // ===================================================

    const candidate:
      CandidateData = {

      id: Date.now(),

      name,

      email,

      phone:
        this.newCandidate.phone || '',

      position:
        selectedJob.title,

      experience:
        this.newCandidate.experience || '',

      status:
        this.newCandidate.status || 'Applied',

      location:
        this.newCandidate.location || '',

      skills:
        this.newCandidate.skills || '',

      education:
        this.newCandidate.education || '',

      linkedin:
        this.newCandidate.linkedin || '',

      portfolio:
        this.newCandidate.portfolio || '',

      notes:
        this.newCandidate.notes || '',

      appliedDate:
        new Date().toLocaleDateString(),

      jobId:
        selectedJob.id,

    };


    console.log(
      'Candidate being added:',
      candidate
    );


    this.isAddingCandidate =
      true;


    this.cdr.detectChanges();


    // ===================================================
    // SAVE CANDIDATE
    // ===================================================

    this.candidateService

      .addCandidate(candidate)

      .subscribe({

        next: (addedCandidate) => {

          console.log(
            'Candidate added:',
            addedCandidate
          );


          const newCandidate:
            Candidate = {

            ...addedCandidate,

            appliedDate:
              addedCandidate.appliedDate ||
              new Date().toLocaleDateString(),

            jobId:
              addedCandidate.jobId ??
              null,

          };


          this.candidates = [

            newCandidate,

            ...this.candidates,

          ];


          this.closeAddModal();


          this.cdr.detectChanges();

        },


        error: (error) => {

          console.error(
            'Error adding candidate:',
            error
          );


          this.isAddingCandidate =
            false;


          alert(
            'Unable to add candidate. Please try again.'
          );


          this.cdr.detectChanges();

        },

      });

  }


  // =====================================================
  // DELETE CANDIDATE
  // =====================================================

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


        error: (error) => {

          console.error(
            'Error deleting candidate:',
            error
          );


          alert(
            'Unable to delete candidate. Please try again.'
          );


          this.cdr.detectChanges();

        },

      });

  }


  // =====================================================
  // OPEN EDIT MODAL
  // =====================================================

  openEditModal(
    candidate: Candidate
  ): void {

    this.editingCandidate = {

      ...candidate,

      jobId:
        candidate.jobId ??
        null,

    };


    this.showEditModal =
      true;


    this.cdr.detectChanges();

  }


  // =====================================================
  // CLOSE EDIT MODAL
  // =====================================================

  closeEditModal(): void {

    this.showEditModal =
      false;

    this.editingCandidate =
      null;

    this.cdr.detectChanges();

  }


  // =====================================================
  // EDIT JOB SELECTED
  // =====================================================

  onEditJobSelected(): void {

    if (
      !this.editingCandidate
    ) {

      return;

    }


    const jobId =
      this.editingCandidate.jobId;


    if (

      jobId === null ||

      jobId === undefined ||

      jobId === ''

    ) {

      this.editingCandidate.position =
        '';

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

    }

    else {

      this.editingCandidate.position =
        '';

    }

  }


  // =====================================================
  // UPDATE CANDIDATE
  // =====================================================

  updateCandidate(): void {

    if (
      !this.editingCandidate
    ) {

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


    // ===================================================
    // VALIDATION
    // ===================================================

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


    // ===================================================
    // COMPLETE UPDATED CANDIDATE
    // ===================================================

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
        this.editingCandidate.status || 'Applied',

      location:
        this.editingCandidate.location || '',

      skills:
        this.editingCandidate.skills || '',

      education:
        this.editingCandidate.education || '',

      linkedin:
        this.editingCandidate.linkedin || '',

      portfolio:
        this.editingCandidate.portfolio || '',

      notes:
        this.editingCandidate.notes || '',

      appliedDate:
        this.editingCandidate.appliedDate,

      jobId:
        selectedJob.id,

    };


    console.log(
      'Candidate being updated:',
      updatedCandidate
    );


    // ===================================================
    // UPDATE API
    // ===================================================

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
                updated.jobId ??
                null,

            };

          }


          this.closeEditModal();


          this.cdr.detectChanges();

        },


        error: (error) => {

          console.error(
            'Error updating candidate:',
            error
          );


          alert(
            'Unable to update candidate. Please try again.'
          );


          this.cdr.detectChanges();

        },

      });

  }


  // =====================================================
  // CONFIRM DELETE
  // =====================================================

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