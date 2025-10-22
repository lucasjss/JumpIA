import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface FactCheckRequest {
  content: string;
  content_type: 'text' | 'url' | 'image' | 'video';
  check_sources?: boolean;
  language?: string;
}

export interface FactCheckResponse {
  content: string;
  content_type: string;
  overall_credibility: string;
  credibility_score: number;
  summary: string;
  claims: Claim[];
  sources_checked: Source[];
  red_flags: string[];
  timestamp: string;
  processing_time: number;
}

export interface Claim {
  text: string;
  veracity: string;
  confidence: number;
  explanation: string;
  sources: Source[];
}

export interface Source {
  title: string;
  url: string;
  credibility: string;
  relevance: number;
  summary: string;
}

@Injectable({
  providedIn: 'root'
})
export class FactCheckService {
  private apiUrl = window.location.hostname === 'localhost' 
    ? 'http://localhost:8000/api'
    : 'https://8000-iwyo1m0w2n9h4usjdhprd-d052c954.manusvm.computer/api';

  constructor(private http: HttpClient) { }

  checkFacts(request: FactCheckRequest): Observable<FactCheckResponse> {
    return this.http.post<FactCheckResponse>(
      `${this.apiUrl}/factcheck`,
      request
    );
  }

  quickCheck(request: FactCheckRequest): Observable<FactCheckResponse> {
    return this.http.post<FactCheckResponse>(
      `${this.apiUrl}/factcheck/quick`,
      request
    );
  }

  uploadFile(file: File, checkSources: boolean = false, language: string = 'pt'): Observable<FactCheckResponse> {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('check_sources', checkSources.toString());
    formData.append('language', language);
    return this.http.post<FactCheckResponse>(`${this.apiUrl}/factcheck/upload`, formData);
  }

  getTrustedSources(): Observable<any> {
    return this.http.get(`${this.apiUrl}/sources/trusted`);
  }

  healthCheck(): Observable<any> {
    const baseUrl = window.location.hostname === 'localhost'
      ? 'http://localhost:8000'
      : 'https://8000-iwyo1m0w2n9h4usjdhprd-d052c954.manusvm.computer';
    return this.http.get(`${baseUrl}/health`);
  }

  getApiInfo(): Observable<any> {
    return this.http.get(`${this.apiUrl}/info`);
  }
}

