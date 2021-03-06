import { Component, OnInit } from '@angular/core';
import { Router } from "@angular/router";
import { AlertNotificationService } from "../../utils/notification.service";
import { Global } from '../../global';
import { UserService } from "../user.service";

declare var $: any;

@Component({
  selector: 'sa-logout',
  template: `
<div id="logout" (click)="showPopup()" class="btn-header transparent pull-right">
        <span> <a routerlink="/login" title="Sign Out" data-action="userLogout"
                  data-logout-msg="You can improve your security further after logging out by closing this opened browser">Logout</a> </span>
    </div>
  `,
  styles: []
})
export class LogoutComponent implements OnInit {

  constructor(private router: Router,
    private alertNotificationService: AlertNotificationService,
    private userService: UserService) { }

  showPopup() {
    this.alertNotificationService.smartMessageBox({
      title: "<i class='fa fa-sign-out txt-color-orangeDark'></i> Logout <span class='txt-color-orangeDark'><strong>" + $('#show-shortcut').text() + "</strong></span> ?",
      content: "You can improve your security further after logging out by closing this opened browser",
      buttons: '[No][Yes]'

    }, (ButtonPressed) => {
      if (ButtonPressed == "Yes") {
        this.logout()
      }
    });
  }

  logout() {
    // this.userService.userLogout().subscribe(response => {
    localStorage.setItem('Authentication', '')
    localStorage.setItem('currentUser', '')
    localStorage.setItem('userData', '')
    localStorage.setItem('userRole', '')
    this.router.navigate(['/login'])
    // })
    if (Global.stompClient) {
      Global.stompClient.disconnect();
    }
  }

  ngOnInit() {

  }



}
