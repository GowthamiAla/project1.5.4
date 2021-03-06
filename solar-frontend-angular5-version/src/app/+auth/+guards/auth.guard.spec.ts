import { TestBed, async } from '@angular/core/testing';
import { FormsModule } from '@angular/forms';
import { HttpModule } from '@angular/http';
import { CommonModule } from '@angular/common';
import 'rxjs/Rx';
import 'rxjs/add/observable/throw';
import { Router, RouterStateSnapshot, ActivatedRouteSnapshot } from '@angular/router';
import 'rxjs/add/operator/map';
import { AuthGuard } from './auth.guard';



describe('Auth Guard:', () => {
    let mockSnapshot: any = jasmine.createSpyObj<RouterStateSnapshot>("RouterStateSnapshot", ['toString']);
    let authguard: AuthGuard;

    let router = {
        navigate: jasmine.createSpy('navigate')
    };


    //clearing the data


    // async beforeEach
    beforeEach(async(() => {
        TestBed.configureTestingModule({
            imports: [FormsModule, CommonModule, HttpModule],
            providers: [AuthGuard,
                { provide: Router, useValue: router },
                { provide: RouterStateSnapshot, useValue: mockSnapshot }
            ]
        })
            .compileComponents(); // compile template and css
    }));

    // synchronous beforeEach
    beforeEach(() => {
        authguard = TestBed.get(AuthGuard);
    });



    it('Auth Guard:user state is not logged: canActivate should return false if the user state is not logged in', () => {
        let status = localStorage.clear();
        expect(authguard.canActivate(new ActivatedRouteSnapshot(), mockSnapshot)).toBe(false);
    })

    it('Auth Guard:user state is not logged : canActivatechild should return false if the user state is not logged in', () => {
        expect(authguard.canActivateChild(new ActivatedRouteSnapshot(), mockSnapshot)).toBe(false);
    })


    it('Auth Guard passing mock values to login', () => {
        localStorage.setItem('currentUser', 'john@metanoiasolutions.net');
        localStorage.setItem('status', '200');

        let status = localStorage.getItem('currentUser');
        expect(status).toBeDefined();
    })

    it('Auth Guard:user state is  logged: canActivate should return true if the user state is logged in', () => {
        expect(authguard.canActivate(new ActivatedRouteSnapshot(), mockSnapshot)).toBe(true);
    })

    it('Auth Guard:user state is not logged: canActivatechild should return true if the user state is logged in', () => {
        expect(authguard.canActivateChild(new ActivatedRouteSnapshot(), mockSnapshot)).toBe(true);
    })



    it('Auth guard cleared mock values', () => {
        let status = localStorage.removeItem('currentUser');
        localStorage.removeItem('status');
        expect(status).toBe(undefined);

    })
    

});
