import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, map } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class GptService {
  private apiUrl = 'https://openrouter.ai/api/v1/chat/completions';
  // private apiKey = 'Bearer APIKEY'
  private apiKey = 'Bearer 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'
  private headers = new HttpHeaders({
    'Authorization': this.apiKey,
    'HTTP-Referer': 'https://www.your-site.com',
    'X-Title': 'YourSiteName',
    'Content-Type': 'application/json',
  });

  constructor(private http: HttpClient) { }

  sendMessage(message: string): Observable<string> {
    const body = {
      model: 'google/gemma-3n-e4b-it:free',
      messages: [
        {
          role: 'user',
          content: message,
          temperature: 0.5, // 較低的值可能加快回應
          stream: false // 確保stream設為false除非你需要串流
        },
      ],
    };

    return this.http.post<any>(this.apiUrl, body, { headers: this.headers }).pipe(
      map(res => res.choices?.[0]?.message?.content || 'No response received.')
    );
  }
}
