import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, map } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class GptService {
  private apiUrl = 'https://openrouter.ai/api/v1/chat/completions';
  private apiKey = 'Bearer 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';
  private headers = new HttpHeaders({
    'Authorization': this.apiKey,
    'HTTP-Referer': 'https://www.your-site.com',
    'X-Title': 'YourSiteName',
    'Content-Type': 'application/json',
  });

  constructor(private http: HttpClient) { }

  sendMessage(message: string): Observable<string> {
    const body = {
      model: 'deepseek/deepseek-r1:free',
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
