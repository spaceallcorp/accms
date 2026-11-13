import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { TranslateModule, TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, TranslateModule],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css',
  standalone: true,
})
export class AppComponent {
  title = 'CMS Multi-Site Control Plane';

  constructor(private translate: TranslateService) {
    this.translate.addLangs(['pt', 'en']);
    this.translate.setDefaultLang('pt');
    this.translate.use('pt');
  }
}
