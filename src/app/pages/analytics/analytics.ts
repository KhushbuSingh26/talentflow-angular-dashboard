import {
  Component,
  AfterViewInit,
  OnDestroy,
  ChangeDetectorRef,
} from '@angular/core';

import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { Chart } from 'chart.js/auto';

import {
  CandidateService,
  CandidateData,
} from '../../services/candidate';

import {
  JobService,
  JobData,
} from '../../services/job.service';

import {
  InterviewService,
  InterviewData,
} from '../../services/interview.service';


@Component({
  selector: 'app-analytics',

  imports: [
    CommonModule,
    FormsModule,
  ],

  styleUrl: './analytics.css',

  templateUrl: './analytics.html',
})
export class Analytics
  implements AfterViewInit, OnDestroy {

  recruitmentChart: Chart | undefined;

  candidateChart: Chart | undefined;

  hiringChart: Chart | undefined;


  candidates: CandidateData[] = [];

  jobs: JobData[] = [];

  interviews: InterviewData[] = [];


  selectedDateFilter = 'This Month';


  hiringSuccessRate = 0;


  private viewReady = false;


  analyticsCards = [

    {
      title: 'Total Candidates',
      value: 0,
      change: 'Live',
      description: 'Total candidates',
    },

    {
      title: 'Active Jobs',
      value: 0,
      change: 'Live',
      description: 'Currently hiring',
    },

    {
      title: 'Interviews',
      value: 0,
      change: 'Live',
      description: 'Total scheduled interviews',
    },

    {
      title: 'Successful Hires',
      value: 0,
      change: 'Live',
      description: 'Selected candidates',
    },

  ];


  candidateStatus = [

    {
      status: 'Applied',
      count: 0,
      percentage: 0,
    },

    {
      status: 'Shortlisted',
      count: 0,
      percentage: 0,
    },

    {
      status: 'Screening',
      count: 0,
      percentage: 0,
    },

    {
      status: 'Interview',
      count: 0,
      percentage: 0,
    },

    {
      status: 'Selected',
      count: 0,
      percentage: 0,
    },

    {
      status: 'Rejected',
      count: 0,
      percentage: 0,
    },

  ];


  constructor(

    private candidateService: CandidateService,

    private jobService: JobService,

    private interviewService: InterviewService,

    private cdr: ChangeDetectorRef

  ) {}


  /*
   * PAGE INITIALIZATION
   */

  ngAfterViewInit(): void {

    this.viewReady = true;

    this.loadAnalyticsData();

  }


  /*
   * LOAD ANALYTICS DATA
   */

  loadAnalyticsData(): void {

    /*
     * Load candidates from API
     */

    this.candidateService
      .getCandidates()
      .subscribe({

        next: (
          candidates: CandidateData[]
        ) => {

          console.log(
            'Analytics candidates loaded:',
            candidates
          );

          this.candidates =
            candidates || [];

          this.updateCandidateStatus();

          this.calculateHiringSuccessRate();

          this.updateAnalyticsCards();

          this.refreshCharts();

          this.cdr.detectChanges();

        },

        error: (error) => {

          console.error(
            'Error loading candidates:',
            error
          );

          this.candidates = [];

          this.updateCandidateStatus();

          this.calculateHiringSuccessRate();

          this.updateAnalyticsCards();

          this.refreshCharts();

          this.cdr.detectChanges();

        },

      });


    /*
     * Load jobs from API
     */

    this.jobService
      .getJobs()
      .subscribe({

        next: (
          jobs: JobData[]
        ) => {

          console.log(
            'Analytics jobs loaded:',
            jobs
          );

          this.jobs =
            jobs || [];

          this.updateAnalyticsCards();

          this.refreshCharts();

          this.cdr.detectChanges();

        },

        error: (error) => {

          console.error(
            'Error loading jobs:',
            error
          );

          this.jobs = [];

          this.updateAnalyticsCards();

          this.refreshCharts();

          this.cdr.detectChanges();

        },

      });


    /*
     * Load interviews from API
     */

    this.interviewService
      .getInterviews()
      .subscribe({

        next: (
          interviews: InterviewData[]
        ) => {

          console.log(
            'Analytics interviews loaded:',
            interviews
          );

          this.interviews =
            interviews || [];

          this.updateAnalyticsCards();

          this.refreshCharts();

          this.cdr.detectChanges();

        },

        error: (error) => {

          console.error(
            'Error loading interviews:',
            error
          );

          this.interviews = [];

          this.updateAnalyticsCards();

          this.refreshCharts();

          this.cdr.detectChanges();

        },

      });

  }


  /*
   * REFRESH ALL CHARTS
   */

  refreshCharts(): void {

    if (!this.viewReady) {
      return;
    }

    setTimeout(() => {

      this.createRecruitmentChart();

      this.createCandidateChart();

      this.createHiringChart();

    });

  }


  /*
   * ANALYTICS CARDS
   */

  updateAnalyticsCards(): void {

    const totalCandidates =
      this.candidates.length;


    const activeJobs =
      this.jobs.filter(
        job =>
          (job.status || '')
            .toLowerCase()
            .trim() === 'open'
      ).length;


    const totalInterviews =
      this.interviews.length;


    const successfulHires =
      this.candidates.filter(
        candidate =>
          (candidate.status || '')
            .toLowerCase()
            .trim() === 'selected'
      ).length;


    this.analyticsCards = [

      {
        title: 'Total Candidates',

        value:
          totalCandidates,

        change: 'Live',

        description:
          'Total candidates',
      },


      {
        title: 'Active Jobs',

        value:
          activeJobs,

        change: 'Live',

        description:
          'Currently hiring',
      },


      {
        title: 'Interviews',

        value:
          totalInterviews,

        change: 'Live',

        description:
          'Total scheduled interviews',
      },


      {
        title: 'Successful Hires',

        value:
          successfulHires,

        change: 'Live',

        description:
          'Selected candidates',
      },

    ];

  }


  /*
   * CANDIDATE STATUS
   */

  updateCandidateStatus(): void {

    const total =
      this.candidates.length;


    const getCount =
      (status: string): number => {

        return this.candidates.filter(
          candidate =>
            (candidate.status || '')
              .toLowerCase()
              .trim() ===
            status
              .toLowerCase()
              .trim()
        ).length;

      };


    const applied =
      getCount('Applied');


    const shortlisted =
      getCount('Shortlisted');


    const screening =
      getCount('Screening');


    const interview =
      getCount('Interview');


    const selected =
      getCount('Selected');


    const rejected =
      getCount('Rejected');


    this.candidateStatus = [

      {
        status: 'Applied',

        count: applied,

        percentage:
          this.calculatePercentage(
            applied,
            total
          ),
      },


      {
        status: 'Shortlisted',

        count: shortlisted,

        percentage:
          this.calculatePercentage(
            shortlisted,
            total
          ),
      },


      {
        status: 'Screening',

        count: screening,

        percentage:
          this.calculatePercentage(
            screening,
            total
          ),
      },


      {
        status: 'Interview',

        count: interview,

        percentage:
          this.calculatePercentage(
            interview,
            total
          ),
      },


      {
        status: 'Selected',

        count: selected,

        percentage:
          this.calculatePercentage(
            selected,
            total
          ),
      },


      {
        status: 'Rejected',

        count: rejected,

        percentage:
          this.calculatePercentage(
            rejected,
            total
          ),
      },

    ];

  }


  /*
   * PERCENTAGE
   */

  calculatePercentage(
    value: number,
    total: number
  ): number {

    if (total === 0) {
      return 0;
    }


    return Math.round(
      (value / total) * 100
    );

  }


  /*
   * HIRING SUCCESS RATE
   */

  calculateHiringSuccessRate(): void {

    const totalCandidates =
      this.candidates.length;


    const selectedCandidates =
      this.candidates.filter(
        candidate =>
          (candidate.status || '')
            .toLowerCase()
            .trim() === 'selected'
      ).length;


    this.hiringSuccessRate =
      this.calculatePercentage(
        selectedCandidates,
        totalCandidates
      );

  }


  /*
   * CHECK CANDIDATE AGAINST JOB
   *
   * First preference:
   * candidate.jobId === job.id
   *
   * Fallback:
   * candidate.position === job.title
   */

  isCandidateForJob(
    candidate: CandidateData,
    job: JobData
  ): boolean {

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


  /*
   * GET JOB APPLICANT COUNT
   */

  getJobApplicantCount(
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


  /*
   * RECRUITMENT OVERVIEW
   *
   * Applicant count is calculated
   * directly from candidates.
   *
   * This keeps Analytics consistent
   * with Dashboard and Jobs page.
   */

  createRecruitmentChart(): void {

    const canvas =
      document.getElementById(
        'recruitmentChart'
      ) as HTMLCanvasElement | null;


    if (!canvas) {
      return;
    }


    this.recruitmentChart?.destroy();


    if (!this.jobs.length) {
      return;
    }


    const chartJobs =
      [...this.jobs]

        .map(job => {

          const applicantCount =
            this.getJobApplicantCount(
              job
            );


          return {

            ...job,

            calculatedApplicants:
              applicantCount,

          };

        })

        .sort(
          (a, b) =>
            b.calculatedApplicants -
            a.calculatedApplicants
        )

        .slice(0, 6);


    const labels =
      chartJobs.map(
        job =>
          job.title
      );


    const applications =
      chartJobs.map(
        job =>
          job.calculatedApplicants
      );


    this.recruitmentChart =
      new Chart(
        canvas,
        {

          type: 'bar',

          data: {

            labels,

            datasets: [

              {

                label:
                  'Candidates',

                data:
                  applications,

                backgroundColor:
                  '#82B6E8',

                borderRadius:
                  5,

                barPercentage:
                  0.55,

                categoryPercentage:
                  0.7,

              },

            ],

          },


          options: {

            responsive: true,

            maintainAspectRatio:
              false,


            plugins: {

              legend: {

                display: false,

              },

            },


            scales: {

              x: {

                grid: {

                  display: false,

                },

              },


              y: {

                beginAtZero: true,

                ticks: {

                  stepSize: 1,

                },

                grid: {

                  color:
                    '#EDF1F5',

                },

              },

            },

          },

        }
      );

  }


  /*
   * CANDIDATE DISTRIBUTION
   */

  createCandidateChart(): void {

    const canvas =
      document.getElementById(
        'candidateChart'
      ) as HTMLCanvasElement | null;


    if (!canvas) {
      return;
    }


    this.candidateChart?.destroy();


    const labels =
      this.candidateStatus.map(
        item =>
          item.status
      );


    const data =
      this.candidateStatus.map(
        item =>
          item.count
      );


    this.candidateChart =
      new Chart(
        canvas,
        {

          type: 'doughnut',

          data: {

            labels,

            datasets: [

              {

                data,

                backgroundColor: [

                  '#82B6E8',

                  '#9C83D4',

                  '#B7D3ED',

                  '#EDCD63',

                  '#8FC7B5',

                  '#E88B8B',

                ],

                borderColor:
                  '#FFFFFF',

                borderWidth: 3,

                hoverOffset: 8,

              },

            ],

          },


          options: {

            responsive: true,

            maintainAspectRatio:
              false,

            cutout:
              '65%',


            plugins: {

              legend: {

                position:
                  'bottom',

                labels: {

                  padding: 16,

                  boxWidth: 12,

                  boxHeight: 12,

                },

              },

            },

          },

        }
      );

  }


  /*
   * HIRING PERFORMANCE
   */

  createHiringChart(): void {

    const canvas =
      document.getElementById(
        'hiringChart'
      ) as HTMLCanvasElement | null;


    if (!canvas) {
      return;
    }


    this.hiringChart?.destroy();


    const successRate =
      this.hiringSuccessRate;


    const remaining =
      Math.max(
        0,
        100 - successRate
      );


    this.hiringChart =
      new Chart(
        canvas,
        {

          type: 'doughnut',

          data: {

            datasets: [

              {

                data: [

                  successRate,

                  remaining,

                ],

                backgroundColor: [

                  '#82B6E8',

                  '#E7EEF5',

                ],

                borderWidth:
                  0,

              },

            ],

          },


          options: {

            responsive: true,

            maintainAspectRatio:
              false,

            cutout:
              '78%',


            rotation:
              -90,

            circumference:
              180,


            plugins: {

              legend: {

                display: false,

              },


              tooltip: {

                enabled: false,

              },

            },

          },

        }
      );

  }


  /*
   * DATE FILTER
   */

  onDateFilterChange(): void {

    this.loadAnalyticsData();

  }


  /*
   * CLEANUP
   */

  ngOnDestroy(): void {

    this.recruitmentChart?.destroy();

    this.candidateChart?.destroy();

    this.hiringChart?.destroy();

  }

}