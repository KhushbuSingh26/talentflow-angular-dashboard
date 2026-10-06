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
export class Analytics implements AfterViewInit, OnDestroy {

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
  ) {

    /*
     * Global Chart.js text color.
     * Soft gray instead of dark black.
     */

    Chart.defaults.color = '#6B7280';

    Chart.defaults.font.family =
      'Arial, Helvetica, sans-serif';

    Chart.defaults.font.size = 12;

  }


  ngAfterViewInit(): void {

    this.viewReady = true;

    this.loadAnalyticsData();

  }


  loadAnalyticsData(): void {

    this.candidateService.getCandidates().subscribe({

      next: (candidates: CandidateData[]) => {

        console.log(
          'Analytics candidates loaded:',
          candidates
        );

        this.candidates = candidates || [];

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


    this.jobService.getJobs().subscribe({

      next: (jobs: JobData[]) => {

        console.log(
          'Analytics jobs loaded:',
          jobs
        );

        this.jobs = jobs || [];

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


    this.interviewService.getInterviews().subscribe({

      next: (interviews: InterviewData[]) => {

        console.log(
          'Analytics interviews loaded:',
          interviews
        );

        this.interviews = interviews || [];

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
        value: totalCandidates,
        change: 'Live',
        description: 'Total candidates',
      },

      {
        title: 'Active Jobs',
        value: activeJobs,
        change: 'Live',
        description: 'Currently hiring',
      },

      {
        title: 'Interviews',
        value: totalInterviews,
        change: 'Live',
        description: 'Total scheduled interviews',
      },

      {
        title: 'Successful Hires',
        value: successfulHires,
        change: 'Live',
        description: 'Selected candidates',
      },

    ];

  }


  updateCandidateStatus(): void {

    const total =
      this.candidates.length;


    const getCount =
      (status: string): number =>
        this.candidates.filter(
          candidate =>
            (candidate.status || '')
              .toLowerCase()
              .trim() ===
            status
              .toLowerCase()
              .trim()
        ).length;


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


    return candidatePosition === jobTitle;

  }


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


  private isDarkTheme(): boolean {

    return (
      document.body.classList.contains(
        'dark-theme'
      ) ||
      document.documentElement.classList.contains(
        'dark-theme'
      )
    );

  }


  private getChartTheme() {

    /*
     * Light professional gray chart text.
     * Avoids harsh black while keeping labels
     * clearly visible.
     */

    return {

      text: '#6B7280',

      mutedText: '#9CA3AF',

      grid: this.isDarkTheme()
        ? 'rgba(255,255,255,0.10)'
        : 'rgba(107,114,128,0.10)',

      tooltipBackground:
        this.isDarkTheme()
          ? '#171329'
          : '#111827',

      hiringTrack:
        this.isDarkTheme()
          ? '#302846'
          : '#E9E7F2',

    };

  }


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

        .map(job => ({

          ...job,

          calculatedApplicants:
            this.getJobApplicantCount(
              job
            ),

        }))

        .sort(
          (a, b) =>
            b.calculatedApplicants -
            a.calculatedApplicants
        )

        .slice(0, 6);


    const labels =
      chartJobs.map(
        job => job.title
      );


    const applications =
      chartJobs.map(
        job =>
          job.calculatedApplicants
      );


    const theme =
      this.getChartTheme();


    const chartColors = [

      '#7C3AED',

      '#6D28D9',

      '#4F46E5',

      '#2563EB',

      '#0891B2',

      '#0D9488',

    ];


    this.recruitmentChart =
      new Chart(canvas, {

        type: 'bar',

        data: {

          labels,

          datasets: [{

            label: 'Candidates',

            data: applications,

            backgroundColor:
              chartColors.slice(
                0,
                applications.length
              ),

            borderColor:
              chartColors.slice(
                0,
                applications.length
              ),

            borderWidth: 1,

            borderRadius: 12,

            borderSkipped: false,

            barPercentage: 0.72,

            categoryPercentage: 0.76,

            maxBarThickness: 38,

            hoverBackgroundColor: [

              '#8B5CF6',

              '#7C3AED',

              '#6366F1',

              '#3B82F6',

              '#06B6D4',

              '#14B8A6',

            ],

            hoverBorderColor:
              '#FFFFFF',

            hoverBorderWidth: 2,

          }],

        },


        options: {

          indexAxis: 'y',

          responsive: true,

          maintainAspectRatio: false,


          layout: {

            padding: {

              top: 8,

              right: 18,

              bottom: 8,

              left: 8,

            },

          },


          animation: {

            duration: 1000,

            easing: 'easeOutQuart',

          },


          interaction: {

            mode: 'nearest',

            intersect: true,

          },


          plugins: {

            legend: {

              display: false,

            },


            tooltip: {

              enabled: true,

              backgroundColor:
                theme.tooltipBackground,

              titleColor:
                '#FFFFFF',

              bodyColor:
                '#FFFFFF',

              borderColor:
                '#8B5CF6',

              borderWidth: 1,

              padding: 13,

              displayColors: true,

              cornerRadius: 10,

              callbacks: {

                label: (context) =>
                  ` Candidates: ${context.parsed.x}`,

              },

            },

          },


          scales: {

            y: {

              grid: {

                display: false,

              },

              ticks: {

                color:
                  theme.text,

                padding: 10,

                autoSkip: false,

                maxRotation: 0,

                minRotation: 0,

                font: {

                  size: 12,

                  weight: 500,

                },

              },

            },


            x: {

              beginAtZero: true,

              ticks: {

                color:
                  theme.mutedText,

                stepSize: 1,

                precision: 0,

                padding: 6,

                font: {

                  size: 11,

                  weight: 400,

                },

              },

              grid: {

                color:
                  theme.grid,

              },

            },

          },

        },

      });

  }


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
        item => item.status
      );


    const data =
      this.candidateStatus.map(
        item => item.count
      );


    const theme =
      this.getChartTheme();


    this.candidateChart =
      new Chart(canvas, {

        type: 'doughnut',

        data: {

          labels,

          datasets: [{

            data,

            backgroundColor: [

              '#6D28D9',

              '#4F46E5',

              '#0891B2',

              '#F59E0B',

              '#16A34A',

              '#E11D48',

            ],

            borderWidth: 0,

            hoverOffset: 14,

            spacing: 4,

          }],

        },


        options: {

          responsive: true,

          maintainAspectRatio: false,

          cutout: '60%',


          animation: {

            duration: 1000,

            easing: 'easeOutQuart',

          },


          interaction: {

            mode: 'nearest',

            intersect: true,

          },


          layout: {

            padding: {

              top: 8,

              right: 8,

              bottom: 8,

              left: 8,

            },

          },


          plugins: {

            legend: {

              display: true,

              position: 'bottom',

              labels: {

                color:
                  theme.text,

                padding: 16,

                boxWidth: 11,

                boxHeight: 11,

                usePointStyle: true,

                pointStyle: 'circle',

                textAlign: 'left',

                font: {

                  size: 11,

                  weight: 500,

                },

              },

            },


            tooltip: {

              enabled: true,

              backgroundColor:
                theme.tooltipBackground,

              titleColor:
                '#FFFFFF',

              bodyColor:
                '#FFFFFF',

              borderColor:
                '#7C3AED',

              borderWidth: 1,

              padding: 12,

              cornerRadius: 10,

              callbacks: {

                label: (context) => {

                  const value =
                    Number(
                      context.raw || 0
                    );


                  const total =
                    data.reduce(
                      (sum, item) =>
                        sum + item,
                      0
                    );


                  const percentage =
                    total > 0
                      ? Math.round(
                          (value / total) *
                          100
                        )
                      : 0;


                  return `${context.label}: ${value} (${percentage}%)`;

                },

              },

            },

          },

        },

      });

  }


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
      Math.max(
        0,
        Math.min(
          100,
          this.hiringSuccessRate
        )
      );


    const remaining =
      Math.max(
        0,
        100 - successRate
      );


    const theme =
      this.getChartTheme();


    this.hiringChart =
      new Chart(canvas, {

        type: 'doughnut',

        data: {

          datasets: [

            {

              data: [

                successRate,

                remaining,

              ],

              backgroundColor: [

                '#7C3AED',

                theme.hiringTrack,

              ],

              borderWidth: 0,

              hoverBackgroundColor: [

                '#A78BFA',

                theme.hiringTrack,

              ],

              hoverOffset: 5,

            },

          ],

        },


        options: {

          responsive: true,

          maintainAspectRatio: false,

          cutout: '72%',

          rotation: -115,

          circumference: 230,


          animation: {

            duration: 1200,

            easing: 'easeOutQuart',

          },


          plugins: {

            legend: {

              display: false,

            },


            tooltip: {

              enabled: true,

              backgroundColor:
                theme.tooltipBackground,

              titleColor:
                '#FFFFFF',

              bodyColor:
                '#FFFFFF',

              borderColor:
                '#8B5CF6',

              borderWidth: 1,

              padding: 10,

              cornerRadius: 10,

              callbacks: {

                label: () =>
                  ` Hiring success: ${successRate}%`,

              },

            },

          },

        },

      });


    const centerValue =
      document.querySelector(
        '.chart-center strong'
      ) as HTMLElement | null;


    if (centerValue) {

      centerValue.textContent =
        `${successRate}%`;

    }

  }


  onDateFilterChange(): void {

    this.loadAnalyticsData();

  }


  ngOnDestroy(): void {

    this.recruitmentChart?.destroy();

    this.candidateChart?.destroy();

    this.hiringChart?.destroy();

  }

}