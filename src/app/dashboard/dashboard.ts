import {
  Component,
  AfterViewInit,
  OnDestroy,
  OnInit,
  ChangeDetectorRef,
} from '@angular/core';

import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { Chart } from 'chart.js/auto';

import {
  CandidateService,
  CandidateData,
} from '../services/candidate';

import {
  JobService,
  JobData,
} from '../services/job.service';

import {
  InterviewService,
  InterviewData,
} from '../services/interview.service';

@Component({
  selector: 'app-dashboard',
  imports: [CommonModule],
  styleUrl: './dashboard.css',
  templateUrl: './dashboard.html',
})
export class Dashboard
  implements OnInit, AfterViewInit, OnDestroy {

  recruitmentChart: Chart | undefined;
  pipelineChart: Chart | undefined;
  trafficChart: Chart | undefined;
  weeklyRecruitmentChart: Chart | undefined;

  candidates: CandidateData[] = [];
  jobs: JobData[] = [];
  interviews: InterviewData[] = [];

  private viewReady = false;

  constructor(
    private router: Router,
    private candidateService: CandidateService,
    private jobService: JobService,
    private interviewService: InterviewService,
    private cdr: ChangeDetectorRef
  ) {}

  stats = [
    {
      title: 'Total Candidates',
      value: 0,
      change: '+12%',
      icon: '👥',
    },
    {
      title: 'Active Jobs',
      value: 0,
      change: '+8%',
      icon: '💼',
    },
    {
      title: 'Total Applications',
      value: 0,
      change: '+18%',
      icon: '📄',
    },
    {
      title: 'Interviews',
      value: 0,
      change: '+6%',
      icon: '📅',
    },
  ];

  trafficStats = [
    {
      title: 'Profile Views',
      value: '2,480',
      change: '+14%',
    },
    {
      title: 'Job Views',
      value: '1,856',
      change: '+9%',
    },
    {
      title: 'Job Applications',
      value: '0',
      change: '+18%',
    },
    {
      title: 'Candidate Growth',
      value: '0',
      change: '+12%',
    },
  ];

  pipeline = [
    {
      title: 'Applied',
      count: 0,
      percentage: 0,
    },
    {
      title: 'Screening',
      count: 0,
      percentage: 0,
    },
    {
      title: 'Interview',
      count: 0,
      percentage: 0,
    },
    {
      title: 'Selected',
      count: 0,
      percentage: 0,
    },
    {
      title: 'Rejected',
      count: 0,
      percentage: 0,
    },
  ];

  recentCandidates: {
    name: string;
    position: string;
    status: string;
  }[] = [];

  recentJobs: JobData[] = [];

  topJobs:
    (JobData & {
      engagement: number;
    })[] = [];

  // ==============================
  // PAGE INITIALIZATION
  // ==============================

  ngOnInit(): void {
    this.loadDashboardData();
  }

  // ==============================
  // LOAD DASHBOARD DATA
  // ==============================

  loadDashboardData(): void {

    // ==============================
    // Load Candidates
    // ==============================

    this.candidateService
      .getCandidates()
      .subscribe({
        next: (candidates: CandidateData[]) => {

          const safeCandidates =
            candidates || [];

          this.candidates =
            safeCandidates;

          this.updateCandidateData(
            safeCandidates
          );

          this.updateJobData(
            this.jobs
          );

          this.refreshCharts();

          this.cdr.detectChanges();
        },

        error: () => {

          this.candidates = [];

          this.updateCandidateData([]);

          this.updateJobData(
            this.jobs
          );

          this.refreshCharts();

          this.cdr.detectChanges();
        },
      });

    // ==============================
    // Load Jobs
    // ==============================

    this.jobService
      .getJobs()
      .subscribe({
        next: (jobs: JobData[]) => {

          const safeJobs =
            jobs || [];

          this.jobs =
            safeJobs;

          this.updateJobData(
            safeJobs
          );

          this.refreshCharts();

          this.cdr.detectChanges();
        },

        error: () => {

          this.jobs = [];

          this.updateJobData([]);

          this.refreshCharts();

          this.cdr.detectChanges();
        },
      });

    // ==============================
    // Load Interviews
    // ==============================

    this.interviewService
      .getInterviews()
      .subscribe({
        next: (
          interviews: InterviewData[]
        ) => {

          const safeInterviews =
            interviews || [];

          this.interviews =
            safeInterviews;

          this.stats[3].value =
            safeInterviews.length;

          this.refreshCharts();

          this.cdr.detectChanges();
        },

        error: () => {

          this.interviews = [];

          this.stats[3].value = 0;

          this.refreshCharts();

          this.cdr.detectChanges();
        },
      });
  }

  // ==============================
  // REFRESH CHARTS
  // ==============================

  refreshCharts(): void {

    if (!this.viewReady) {
      return;
    }

    setTimeout(() => {

      this.createRecruitmentChart();

      this.createPipelineChart();

      this.createWeeklyRecruitmentChart(
        this.candidates
      );

      this.createTrafficChart();

    });
  }

  // ==============================
  // UPDATE CANDIDATE DATA
  // ==============================

  updateCandidateData(
    candidates: CandidateData[]
  ): void {

    const safeCandidates =
      candidates || [];

    const totalCandidates =
      safeCandidates.length;

    const totalApplications =
      safeCandidates.length;

    this.stats[0].value =
      totalCandidates;

    this.stats[2].value =
      totalApplications;

    this.trafficStats[2].value =
      totalApplications.toString();

    this.trafficStats[3].value =
      totalCandidates.toString();

    const getStatusCount =
      (status: string): number => {

        return safeCandidates.filter(
          candidate =>
            (candidate.status || '')
              .toLowerCase()
              .trim() === status
        ).length;
      };

    const applied =
      getStatusCount('applied');

    const screening =
      getStatusCount('screening');

    const candidateInterview =
      getStatusCount('interview');

    const selected =
      getStatusCount('selected');

    const rejected =
      getStatusCount('rejected');

    this.pipeline = [
      {
        title: 'Applied',
        count: applied,
        percentage:
          this.calculatePercentage(
            applied,
            totalCandidates
          ),
      },
      {
        title: 'Screening',
        count: screening,
        percentage:
          this.calculatePercentage(
            screening,
            totalCandidates
          ),
      },
      {
        title: 'Interview',
        count: candidateInterview,
        percentage:
          this.calculatePercentage(
            candidateInterview,
            totalCandidates
          ),
      },
      {
        title: 'Selected',
        count: selected,
        percentage:
          this.calculatePercentage(
            selected,
            totalCandidates
          ),
      },
      {
        title: 'Rejected',
        count: rejected,
        percentage:
          this.calculatePercentage(
            rejected,
            totalCandidates
          ),
      },
    ];

    this.recentCandidates =
      safeCandidates
        .slice(0, 4)
        .map(candidate => ({
          name:
            candidate.name ||
            'Unknown',

          position:
            candidate.position ||
            'Not specified',

          status:
            candidate.status ||
            'Applied',
        }));

    this.cdr.detectChanges();
  }

  // ==============================
  // CHECK CANDIDATE AGAINST JOB
  // ==============================

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

  // ==============================
  // GET JOB APPLICANT COUNT
  // ==============================

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

  // ==============================
  // UPDATE JOB DATA
  // ==============================

  updateJobData(
    jobs: JobData[]
  ): void {

    const safeJobs =
      jobs || [];

    const activeJobs =
      safeJobs.filter(
        job =>
          (job.status || '')
            .toLowerCase()
            .trim() === 'open'
      ).length;

    this.stats[1].value =
      activeJobs;

    this.recentJobs =
      safeJobs
        .slice(0, 3)
        .map(job => ({
          ...job,

          applicants:
            this.getJobApplicantCount(
              job
            ),
        }));

    this.topJobs =
      safeJobs
        .map(job => {

          const applicantCount =
            this.getJobApplicantCount(
              job
            );

          return {
            ...job,

            applicants:
              applicantCount,

            engagement:
              Math.min(
                100,
                Math.round(
                  applicantCount * 3
                )
              ),
          };
        })
        .sort(
          (a, b) =>
            (b.applicants || 0) -
            (a.applicants || 0)
        )
        .slice(0, 3);

    this.cdr.detectChanges();
  }

  // ==============================
  // PERCENTAGE CALCULATION
  // ==============================

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

  // ==============================
  // VIEW INITIALIZATION
  // ==============================

  ngAfterViewInit(): void {

    this.viewReady = true;

    setTimeout(() => {

      this.createTrafficChart();

      this.createRecruitmentChart();

      this.createPipelineChart();

      this.createWeeklyRecruitmentChart(
        this.candidates
      );

    });
  }

  // ==============================
  // RECRUITMENT OVERVIEW
  // ==============================

  createRecruitmentChart(): void {

    if (!this.viewReady) {
      return;
    }

    const chartJobs =
      [...this.jobs]
        .map(job => {

          const applicantCount =
            this.getJobApplicantCount(
              job
            );

          const interviewCount =
            this.interviews.filter(
              interview =>
                (interview.position || '')
                  .toLowerCase()
                  .trim() ===
                (job.title || '')
                  .toLowerCase()
                  .trim()
            ).length;

          return {
            ...job,

            calculatedApplicants:
              applicantCount,

            calculatedInterviews:
              interviewCount,
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
        job => job.title
      );

    const applications =
      chartJobs.map(
        job => job.calculatedApplicants
      );

    const interviewCounts =
      chartJobs.map(
        job => job.calculatedInterviews
      );

    setTimeout(() => {

      this.recruitmentChart
        ?.destroy();

      const canvas =
        document.getElementById(
          'recruitmentChart'
        ) as HTMLCanvasElement | null;

      if (!canvas) {
        return;
      }

      this.recruitmentChart =
        new Chart(
          canvas,
          {
            type: 'bar',

            data: {
              labels,

              datasets: [
                {
                  label: 'Applications',

                  data:
                    applications,

                  backgroundColor:
                    '#7C5CFC',

                  borderColor:
                    '#7C5CFC',

                  borderRadius: 8,

                  borderSkipped: false,

                  barThickness: 18,
                },

                {
                  label: 'Interviews',

                  data:
                    interviewCounts,

                  backgroundColor:
                    '#F59E42',

                  borderColor:
                    '#F59E42',

                  borderRadius: 8,

                  borderSkipped: false,

                  barThickness: 18,
                },
              ],
            },

            options: {
              responsive: true,

              maintainAspectRatio: false,

              interaction: {
                mode: 'index',
                intersect: false,
              },

              plugins: {
                legend: {
                  position: 'top',
                  align: 'end',

                  labels: {
                    usePointStyle: true,
                    pointStyle: 'circle',
                    padding: 18,
                  },
                },
              },

              scales: {
                x: {
                  grid: {
                    display: false,
                  },

                  ticks: {
                    maxRotation: 35,
                    minRotation: 0,
                    color: '#64748B',
                  },
                },

                y: {
                  beginAtZero: true,

                  ticks: {
                    stepSize: 1,
                    color: '#64748B',
                  },

                  grid: {
                    color:
                      'rgba(148, 163, 184, 0.16)',
                  },
                },
              },
            },
          }
        );

    }, 0);
  }

  // ==============================
  // CANDIDATE PIPELINE
  // ==============================

  createPipelineChart(): void {

    if (!this.viewReady) {
      return;
    }

    setTimeout(() => {

      this.pipelineChart
        ?.destroy();

      const canvas =
        document.getElementById(
          'pipelineChart'
        ) as HTMLCanvasElement | null;

      if (!canvas) {
        return;
      }

      const pipelineData =
        this.pipeline.map(
          item => item.count
        );

      this.pipelineChart =
        new Chart(
          canvas,
          {
            type: 'doughnut',

            data: {
              labels:
                this.pipeline.map(
                  item => item.title
                ),

              datasets: [
                {
                  data:
                    pipelineData,

                  backgroundColor: [
                    '#7C5CFC',
                    '#4F8DF7',
                    '#F59E42',
                    '#35B77A',
                    '#F06A6A',
                  ],

                  borderColor:
                    '#ffffff',

                  borderWidth: 5,

                  hoverOffset: 10,
                },
              ],
            },

            options: {
              responsive: true,

              maintainAspectRatio: false,

              cutout: '68%',

              plugins: {
                legend: {
                  position: 'bottom',

                  labels: {
                    usePointStyle: true,
                    pointStyle: 'circle',
                    padding: 16,
                    color: '#475569',
                  },
                },
              },
            },
          }
        );

    }, 0);
  }

  // ==============================
  // WEEKLY TRAFFIC
  // ==============================

  createTrafficChart(): void {

    setTimeout(() => {

      this.trafficChart
        ?.destroy();

      const canvas =
        document.getElementById(
          'trafficChart'
        ) as HTMLCanvasElement | null;

      if (!canvas) {
        return;
      }

      this.trafficChart =
        new Chart(
          canvas,
          {
            type: 'line',

            data: {
              labels: [
                'Mon',
                'Tue',
                'Wed',
                'Thu',
                'Fri',
                'Sat',
                'Sun',
              ],

              datasets: [
                {
                  label: 'Profile Views',

                  data: [
                    280,
                    360,
                    310,
                    450,
                    420,
                    380,
                    510,
                  ],

                  borderColor:
                    '#4F8DF7',

                  backgroundColor:
                    'rgba(79, 141, 247, 0.12)',

                  borderWidth: 2.5,

                  tension: 0.42,

                  fill: true,

                  pointRadius: 4,

                  pointHoverRadius: 7,

                  pointBackgroundColor:
                    '#4F8DF7',

                  pointBorderColor:
                    '#ffffff',

                  pointBorderWidth: 2,
                },

                {
                  label: 'Job Views',

                  data: [
                    220,
                    300,
                    270,
                    380,
                    350,
                    330,
                    430,
                  ],

                  borderColor:
                    '#35B77A',

                  backgroundColor:
                    'rgba(53, 183, 122, 0.08)',

                  borderWidth: 2.5,

                  tension: 0.42,

                  fill: true,

                  pointRadius: 4,

                  pointHoverRadius: 7,

                  pointBackgroundColor:
                    '#35B77A',

                  pointBorderColor:
                    '#ffffff',

                  pointBorderWidth: 2,
                },
              ],
            },

            options: {
              responsive: true,

              maintainAspectRatio: false,

              interaction: {
                mode: 'index',
                intersect: false,
              },

              plugins: {
                legend: {
                  position: 'top',

                  align: 'end',

                  labels: {
                    usePointStyle: true,
                    pointStyle: 'circle',
                    padding: 16,

                    color:
                      '#475569',
                  },
                },

                tooltip: {
                  mode: 'index',
                  intersect: false,
                },
              },

              scales: {
                x: {
                  grid: {
                    display: false,
                  },

                  border: {
                    display: false,
                  },

                  ticks: {
                    color:
                      '#64748B',

                    padding: 8,
                  },
                },

                y: {
                  beginAtZero: true,

                  border: {
                    display: false,
                  },

                  ticks: {
                    color:
                      '#64748B',

                    padding: 8,
                  },

                  grid: {
                    color:
                      'rgba(148, 163, 184, 0.12)',
                  },
                },
              },
            },
          }
        );

    }, 0);
  }

  // ==============================
  // WEEKLY RECRUITMENT ACTIVITY
  // ==============================

  createWeeklyRecruitmentChart(
    candidates: CandidateData[]
  ): void {

    if (!this.viewReady) {
      return;
    }

    const applicationsByDay =
      this.getApplicationsByDay(
        candidates || []
      );

    const interviewsByDay =
      this.getInterviewsByDay(
        this.interviews
      );

    const weekDays = [
      'Mon',
      'Tue',
      'Wed',
      'Thu',
      'Fri',
      'Sat',
      'Sun',
    ];

    setTimeout(() => {

      this.weeklyRecruitmentChart
        ?.destroy();

      const canvas =
        document.getElementById(
          'weeklyRecruitmentChart'
        ) as HTMLCanvasElement | null;

      if (!canvas) {
        return;
      }

      this.weeklyRecruitmentChart =
        new Chart(
          canvas,
          {
            type: 'line',

            data: {
              labels: weekDays,

              datasets: [
                {
                  label: 'Applications',

                  data:
                    applicationsByDay,

                  borderColor:
                    '#7C5CFC',

                  backgroundColor:
                    'rgba(124, 92, 252, 0.10)',

                  borderWidth: 2.5,

                  tension: 0.42,

                  fill: true,

                  pointRadius: 4,

                  pointHoverRadius: 7,

                  pointBackgroundColor:
                    '#7C5CFC',

                  pointBorderColor:
                    '#ffffff',

                  pointBorderWidth: 2,
                },

                {
                  label: 'Interviews',

                  data:
                    interviewsByDay,

                  borderColor:
                    '#F59E42',

                  backgroundColor:
                    'rgba(245, 158, 66, 0.08)',

                  borderWidth: 2.5,

                  tension: 0.42,

                  fill: true,

                  pointRadius: 4,

                  pointHoverRadius: 7,

                  pointBackgroundColor:
                    '#F59E42',

                  pointBorderColor:
                    '#ffffff',

                  pointBorderWidth: 2,
                },
              ],
            },

            options: {
              responsive: true,

              maintainAspectRatio: false,

              interaction: {
                mode: 'index',
                intersect: false,
              },

              plugins: {
                legend: {
                  position: 'top',

                  align: 'end',

                  labels: {
                    usePointStyle: true,
                    pointStyle: 'circle',
                    padding: 16,

                    color:
                      '#475569',
                  },
                },

                tooltip: {
                  mode: 'index',
                  intersect: false,
                },
              },

              scales: {
                x: {
                  grid: {
                    display: false,
                  },

                  border: {
                    display: false,
                  },

                  ticks: {
                    color:
                      '#64748B',

                    padding: 8,
                  },
                },

                y: {
                  beginAtZero: true,

                  border: {
                    display: false,
                  },

                  ticks: {
                    stepSize: 1,

                    color:
                      '#64748B',

                    padding: 8,
                  },

                  grid: {
                    color:
                      'rgba(148, 163, 184, 0.12)',
                  },
                },
              },
            },
          }
        );

    }, 0);
  }

  // ==============================
  // APPLICATIONS BY WEEKDAY
  // ==============================

  getApplicationsByDay(
    candidates: CandidateData[]
  ): number[] {

    const result =
      [0, 0, 0, 0, 0, 0, 0];

    candidates.forEach(
      candidate => {

        if (!candidate.appliedDate) {
          return;
        }

        const date =
          this.parseCandidateDate(
            candidate.appliedDate
          );

        if (!date) {
          return;
        }

        const day =
          date.getDay();

        const index =
          day === 0
            ? 6
            : day - 1;

        result[index]++;
      }
    );

    return result;
  }

  // ==============================
  // INTERVIEWS BY WEEKDAY
  // ==============================

  getInterviewsByDay(
    interviews: InterviewData[]
  ): number[] {

    const result =
      [0, 0, 0, 0, 0, 0, 0];

    interviews.forEach(
      interview => {

        if (!interview.date) {
          return;
        }

        const date =
          this.parseInterviewDate(
            interview.date
          );

        if (!date) {
          return;
        }

        const day =
          date.getDay();

        const index =
          day === 0
            ? 6
            : day - 1;

        result[index]++;
      }
    );

    return result;
  }

  // ==============================
  // CANDIDATE DATE PARSER
  // ==============================

  parseCandidateDate(
    dateString: string
  ): Date | null {

    const parsed =
      new Date(dateString);

    if (!isNaN(parsed.getTime())) {
      return parsed;
    }

    const parts =
      dateString.split('/');

    if (parts.length === 3) {

      const first =
        Number(parts[0]);

      const second =
        Number(parts[1]);

      const year =
        Number(parts[2]);

      if (
        !isNaN(first) &&
        !isNaN(second) &&
        !isNaN(year)
      ) {

        if (first > 12) {

          return new Date(
            year,
            second - 1,
            first
          );
        }

        return new Date(
          year,
          first - 1,
          second
        );
      }
    }

    return null;
  }

  // ==============================
  // INTERVIEW DATE PARSER
  // ==============================

  parseInterviewDate(
    dateString: string
  ): Date | null {

    if (
      /^\d{4}-\d{2}-\d{2}$/.test(
        dateString
      )
    ) {

      const [
        year,
        month,
        day,
      ] =
        dateString
          .split('-')
          .map(Number);

      return new Date(
        year,
        month - 1,
        day
      );
    }

    const parsed =
      new Date(dateString);

    if (!isNaN(parsed.getTime())) {
      return parsed;
    }

    return null;
  }

  // ==============================
  // NAVIGATION
  // ==============================

  addCandidate(): void {
    this.router.navigate([
      '/add-candidate',
    ]);
  }

  viewCandidates(): void {
    this.router.navigate([
      '/candidates',
    ]);
  }

  viewJobs(): void {
    this.router.navigate([
      '/jobs',
    ]);
  }

  viewInterviews(): void {
    this.router.navigate([
      '/interviews',
    ]);
  }

  viewAnalytics(): void {
    this.router.navigate([
      '/analytics',
    ]);
  }

  // ==============================
  // CLEANUP
  // ==============================

  ngOnDestroy(): void {

    this.recruitmentChart
      ?.destroy();

    this.pipelineChart
      ?.destroy();

    this.trafficChart
      ?.destroy();

    this.weeklyRecruitmentChart
      ?.destroy();
  }
}