import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface ParsedCandidate {
  name: string;
  email: string;
  phone: string;
  position: string;
  experience: string;
  location: string;
  status: string;
  skills: string;
  education: string;
  linkedin: string;
  portfolio: string;
  notes: string;
}

export interface ResumeParseResponse {
  success: boolean;
  fileName: string;
  candidate: ParsedCandidate;
  rawText: string;
  message?: string;
}

@Injectable({
  providedIn: 'root',
})
export class ResumeParserService {
  private apiUrl =
    'https://talentflow-resume-parser-api.onrender.com/resume/parse';

  constructor(private http: HttpClient) {}

  parseResume(file: File): Observable<ResumeParseResponse> {
    const formData = new FormData();

    formData.append('resume', file);

    return this.http.post<ResumeParseResponse>(
      this.apiUrl,
      formData
    );
  }
}