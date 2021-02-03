import { Component, OnInit } from '@angular/core';
import { AuthService } from './recipes/auth.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {
  loadedFeature = 'recipe';

  constructor( private authService: AuthService){}
  
  ngOnInit(){
    this.authService.autoLogin();
  }
  
}
