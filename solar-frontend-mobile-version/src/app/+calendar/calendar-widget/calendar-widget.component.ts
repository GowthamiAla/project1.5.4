import { Component, OnInit, ElementRef, OnDestroy, OnChanges, ViewChild, Input, ChangeDetectorRef } from '@angular/core';
import { FormsModule, FormBuilder, FormGroup, Validators, FormControl, AbstractControl, FormArray } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { ModalDirective } from "ngx-bootstrap";
import { EventsService } from "../shared/events.service";
import { Subscription } from 'rxjs/Subscription';
import { Observable } from 'rxjs/Rx';
import * as moment from 'moment';
import { Router, ActivatedRoute } from '@angular/router';



declare var $: any;


class CalendarEvent {
  constructor(
    public eventType: string,
    public active: boolean,
    public title: string,
    public description: string,
    public start: string,
    public end: string,
    public createTime: string,
    public lastUpdateTime: string,
    public priority: string,
    public id?: string
  ) { }
}

@Component({
  selector: 'calendar-widget',
  templateUrl: './calendar-widget.component.html',
  styles: [`.FilterDropDownAnimation {
    -webkit-animation-name: none !important;
    -moz-animation-name: flipInX !important;
    -o-animation-name: flipInX !important;
    animation-name: none !important;
    -webkit-animation-duration: 0s !important;
    -moz-animation-duration: .4s !important;
    -o-animation-duration: .4s !important;
    animation-duration: 0s !important;
    -webkit-animation-fill-mode: none !important;
    -moz-animation-fill-mode: both !important;
    -o-animation-fill-mode: both !important;
    animation-fill-mode: none !important;
}



.tooglePosition{
    float:left !important;
}
.filterFormAlign{
margin-bottom: 0px !important;
margin-top: 5px !important;
padding-right:0px;
}

  .filterDropwdownViewAlign{
  color:black;
  position:relative !important;
  top:3px;
  padding:0px !important;
  }
  @media only screen and (min-width:768px){ 
    .filterDropwdownViewAlign{
     min-width: 335px !important;
    left: -296px !important;
    }
    }
    @media only screen and (max-width: 479px) and (min-width: 320px){ 
      .filterDropwdownViewAlign{
      min-width:310px !important;
      left:-255px !important;
      }
    }
    @media only screen and (min-width:479px) and (max-width:768px){
      .filterDropwdownViewAlign{
      min-width: 335px !important;
      left: -280px !important;
      } 
      }
   
`
  ]
})
export class CalendarWidgetComponent {

  notificationDate: any;
  subscription: Subscription;
  private $calendarRef: any;
  private calendar: any;
  //create event attributes
  public eventType: string;
  public activeColorClass: any;
  @Input() public title: string;
  @Input() public description: string;
  @Input() public eventStartDate: string;
  @Input() public eventEnddate: string;
  @Input() public active: boolean;
  @Input() public createTime: string;
  @Input() public lastUpdateTime: string
  public createPriority: string;

  CalenderInputdefaultValue = new Date();
  CalenderInputEnddefaultValue = new Date();

  // update Event attributes
  public updateId: string;
  @Input() public updateTitle: string;
  @Input() public updateDescription: string;
  @Input() public updateEventStartdate: string;
  @Input() public updateEventEnddate: string;
  @Input() public updateActive: boolean;
  @Input() public updateCreateTime: string;
  @Input() public updateLastUpdateTime: string;

  public updatePriority: string;

  //create event form validation attributes
  public complexCreateEventForm: FormGroup;
  public createEventTitle: AbstractControl;
  public createEventDescription: AbstractControl;
  public createEventStartValid: AbstractControl;
  public createEventEndValid: AbstractControl;
  createEventSubmit: boolean = false;
  //update event form validation attributes
  public complexupdateEventForm: FormGroup;
  public updateTitleValid: AbstractControl;
  public updateDescriptionValid: AbstractControl;
  public updateEventStartValid: AbstractControl;
  public updateEventEndValid: AbstractControl;
  updateEventSubmit: boolean = false;

  public createPropertiesForm: FormGroup;
  public CreatePkey: AbstractControl;
  public CreatePvalue: AbstractControl;
  getallEvents: any = {};


  public priorityOptions: any = [];
  public eventTypeOptions: any = [];
  public calendarFilterDropDownToggle: any = '';
  public filterEventsObject: any;
  public activeEvents: boolean = false;

  constructor(private el: ElementRef, private router: Router, private route: ActivatedRoute, private eventsService: EventsService, private fb: FormBuilder, private cdr: ChangeDetectorRef) {
    //create form validations
    this.complexCreateEventForm = fb.group({
      createEventTitle: [null, Validators.compose([Validators.required, Validators.maxLength(32)])],
      createEventDescription: [null, Validators.compose([Validators.required, Validators.maxLength(1000)])],
      createEventStartValid: [null, Validators.compose([Validators.required])],
      createEventEndValid: [null, Validators.compose([Validators.required])]
    })
    this.createEventTitle = this.complexCreateEventForm.controls['createEventTitle'];
    this.createEventDescription = this.complexCreateEventForm.controls['createEventDescription'];
    this.createEventStartValid = this.complexCreateEventForm.controls['createEventStartValid'];
    this.createEventEndValid = this.complexCreateEventForm.controls['createEventEndValid'];

    //update form validations
    this.complexupdateEventForm = fb.group({
      updateTitleValid: [null, Validators.compose([Validators.required, Validators.maxLength(32)])],
      updateDescriptionValid: [null, Validators.compose([Validators.required, Validators.maxLength(1000)])],
      updateEventStartValid: [null, Validators.compose([Validators.required])],
      updateEventEndValid: [null, Validators.compose([Validators.required])]
    })
    this.updateTitleValid = this.complexupdateEventForm.controls['updateTitleValid'];
    this.updateDescriptionValid = this.complexupdateEventForm.controls['updateDescriptionValid'];
    this.updateEventStartValid = this.complexupdateEventForm.controls['updateEventStartValid'];
    this.updateEventEndValid = this.complexupdateEventForm.controls['updateEventEndValid'];

    this.createPropertiesForm = fb.group({
      CreatePkey: [null, Validators.compose([Validators.required])],
      CreatePvalue: [null, Validators.compose([Validators.required])]
    })
    this.CreatePkey = this.createPropertiesForm.controls['CreatePkey'];
    this.CreatePvalue = this.createPropertiesForm.controls['CreatePvalue'];

    //dropdown prioritites options
    this.priorityOptions = [
      { id: 1, name: 'Low',value:'LOW' },
      { id: 2, name: 'Normal',value:'NORMAL' },
      { id: 3, name: 'High',value:'HIGH' },
    ]

    //dropdown event type options
    this.eventTypeOptions =this.Typeevents;

  }


  // modal wizard form steps
  public steps = [
    {
      key: 'step1',
      title: 'Event information',
      valid: false,
      submitted: false,
    },
    {
      key: 'step2',
      title: 'Event Properties',
      valid: false,
      submitted: false,
    },

    {
      key: 'step3',
      title: 'Save Event',
      valid: true,
      submitted: false,
    },
  ];

  showPropertyAttributes: boolean;
  addPropertyAttributes() {
    this.newProperty.newPropertyKey = '';
    this.newProperty.newPropertyValue = '';
    if (this.showPropertyAttributes) {
      this.showPropertyAttributes = false;
    } else {
      this.showPropertyAttributes = true;
    }
  }


  public newProperty: any = {
    newPropertyKey: "data",
    newPropertyValue: "null"
  }
  public properties: any = {};
  submitPropertyData(keyData: any, valueData: any) {
    var obj = this.properties;
    var name = keyData;
    obj[name] = valueData;
    this.showPropertyAttributes = false;
    keyData = null;
    valueData = null;
  }
  deleteProperty(propertyKey) {
    delete this.properties[propertyKey];
  }

  @Input() public options = {
    mode: 'inline',
    disabled: false,
    inline: true,
    emptytext: 'edit'
  };
  public activeStep = this.steps[0];

  prevStep() {
    let idx = this.steps.indexOf(this.activeStep);
    if (idx > 0) {
      this.activeStep = this.steps[idx - 1]
    }
  }
  nextStepFunction(step) {
    let idx = this.steps.indexOf(step);
    this.activeStep = null;
    while (!this.activeStep) {
      idx = idx == this.steps.length - 1 ? 0 : idx + 1;
      if (!this.steps[idx].valid ) {
        this.activeStep = this.steps[idx]
      }

    }
  }
  nextStep() {
    this.activeStep.submitted = true;
    if (this.activeStep.key == 'step1') {
      if (this.popoverAddEvent.isShown) {
        this.addEventData();
      } else if (this.popoverupdateEvent.isShown) {
        this.updateEvent();
      }
      if (this.steps[0].valid) {
        this.nextStepFunction(this.activeStep);
      }
    } else if (this.activeStep.key == 'step2') {
      this.activeStep = null;
      this.activeStep = this.steps[2];
    }
  }

  public PropertySelectData: any;
  propertySelected: boolean = false;
  onPropertySelect() {
    this.propertySelected = true;
  }

  @ViewChild('popoverAddEvent') public popoverAddEvent: ModalDirective;
  public showChildModal(): void {
    this.popoverAddEvent.show();
  }

  public hideChildModal(): void {
    this.popoverAddEvent.hide();
  }

  @ViewChild('popoverupdateEvent') public popoverupdateEvent: ModalDirective;
  public showUpdateChildModal(): void {
    this.popoverupdateEvent.show();
  }

  public hideUpdateChildModal(): void {
    this.popoverupdateEvent.hide();
  }
  render() {
    this.$calendarRef = $('#calendar', this.el.nativeElement);
    this.calendar = this.$calendarRef.fullCalendar({
      lang: 'en',
      editable: true,
      draggable: true,
      selectable: false,
      selectHelper: true,
      unselectAuto: false,
      disableResizing: false,
      droppable: true,

      header: {
        left: 'title', //,today
        center: 'prev, next, today',
        right: 'month, agendaWeek, agendaDay,listMonth,listWeek' //month, agendaDay,
      },

      //showing all the events in calender
      events: (startTime, endTime, timezone, callback) => {
        if (this.filterEventsObject && (this.filterEventsObject.priorities.length || this.filterEventsObject.eventTypes.length || this.filterEventsObject.active)) {
          this.eventsService.getFilterEvents(this.filterEventsObject).then(response => {
            var manuplatedData = this.manuplateResponseData(response);
            callback(manuplatedData.data);
          });

        } else {
          this.eventsService.getAllEvent().then(response => {
            var manuplatedData = this.manuplateResponseData(response);
            callback(manuplatedData.data);
          });
        }
      },
      timeFormat: 'hh:mma',
      textColor: "#fff",
      defaultView: this.changeView('Showing', 'notSelected'),
      //modifications in view calnders like css
      eventRender: (event, element, icon) => {
        element.find(".fc-list-item-time").css({ "width": "30%" });
        element.find(".fc-scroller").css({ "height": "100%" });
        if (event) {
          element.find('.fc-list-item-marker').closest('td').remove();
        }
        if (event.eventType) {
          element.find('.fc-title').css({ "white-space": "nowrap", "overflow": "hidden", "text-overflow": "ellipsis", "max-width": "100%" });
          element.find(".fc-time").append("<i class='air air-top-right fa " + event.eventType + "'></i>");
          element.find(".fc-list-item-marker").append("<i class='fa " + event.eventType + "'></i>");
        }
        if (event.description != "") {
          element.find('.fc-event-title').append("<br/><strong>" + + "</strong>");
        }
      },
      eventAfterAllRender: (view) => {
      },
      //click on calendar to add event
      dayClick: (date, jsEvent, view) => {
        this.activeStep = this.steps[0];
        this.description = '';
        this.title = '';
        this.properties = {};
        this.activeColorClass = this.colorClassNames[0];
        this.eventType = this.Typeevents[0].icon;
        this.eventAddStartEndTimeComparision = false;
        this.eventaddStartValidation = false;
        this.eventaddEndValidation = false;
        this.eventStartDate = date.format();
        this.CalenderInputdefaultValue = new Date(date);
        if (this.calendarView === 'Showing' || this.calendarView === 'month' || this.calendarView === 'Month') {
          this.eventEnddate = moment(this.eventStartDate).add(23, 'h').add(59, 'm').format();
        } else if (this.calendarView === 'agendaWeek' || this.calendarView === 'Week') {
          this.eventEnddate = moment(this.eventStartDate).add(11, 'h').add(59, 'm').format();
        } else if (this.calendarView === 'agendaDay' || this.calendarView === 'Day') {
          this.eventEnddate = moment(this.eventStartDate).add(1, 'h').format();
        }
        this.active = true;
        this.popoverAddEvent.show();
        this.cdr.detectChanges();
      },
      //update event
      eventClick: (calEvent, jsEvent, view) => {
        this.activeStep = this.steps[0];
        this.properties = JSON.parse(calEvent.properties);
        this.updateId = calEvent.id;
        this.updateActive = true;
        this.updateTitle = calEvent.title;
        this.updateCreateTime = calEvent.createTime;
        this.updateDescription = calEvent.description;
        this.updateStartEndComparision = false;
        this.eventUpdateStartValidation = false;
        this.eventUpdateEndValidation = false;
        //priority select
        if (calEvent.priority === 'NORMAL') {
          this.activeColorClass = this.colorClassNames[1];
        } else if (calEvent.priority === 'HIGH') {
          this.activeColorClass = this.colorClassNames[2];
        } else {
          this.activeColorClass = this.colorClassNames[0];
        }
        //icons select
        for (let i = 0; i < this.Typeevents.length; i++) {
          if (this.Typeevents[i].icon === calEvent.eventType ) {
            this.eventType = calEvent.eventType;
            break;
          }
        }
        this.updatePriority = calEvent.priority;
        this.updateEventStartdate = moment(calEvent.start).local().format();
        this.CalenderInputdefaultValue = new Date(this.updateEventStartdate);
        if (calEvent.end === null) {
          this.updateEventEnddate = this.updateEventStartdate;
        } else {
          this.updateEventEnddate = moment(calEvent.end).local().format();
        }
        this.CalenderInputEnddefaultValue = new Date(this.updateEventEnddate);
        this.popoverupdateEvent.show();
        this.cdr.detectChanges();
      },
      eventDragStart: (event, jsEvent, ui, view) => {
        console.log('Start dragg Event');
      },
      eventDragStop: (event, jsEvent, ui, view) => {
        console.log('stop drag Event');
      },
      eventDrop: (event, delta, revertFunc, jsEvent, ui, view) => {
        let date = new Date();
        let updateTime = moment(date).format();
        if (event._end === null) {
          event._end = event._start;
        }
        let StartDate = moment(event._start).local().format();
        let endDate = moment(event._end).local().format();
        // let splitDate = StartDate.split('+');
        // let minutes = moment.duration(splitDate[1]).asMinutes();
        // let newStartDate = moment(StartDate).subtract(minutes, 'minutes').format();
        // let newEndDate = moment(endDate).subtract(minutes, 'minutes').format();
        let draggedEvent = new CalendarEvent(
          event.eventType,
          event.active,
          event.title,
          event.description,
          StartDate,//newStartDate
          endDate,//newEndDate
          event.createTime,
          updateTime,
          event.priority,
          event.id
        );
        let draggedEventDetails: any = draggedEvent;
        if (Object.keys(event.properties).length != 0) {
          draggedEventDetails.properties = event.properties;
        }

        this.eventsService.updateEvent(event.id, draggedEventDetails).then(data => {
          console.log('dragged event updated');
          this.$calendarRef.fullCalendar('refetchEvents');
        });
      }
    }
    );

    $('.fc-header-right, .fc-header-center', this.$calendarRef).hide();
    $('.fc-left', this.$calendarRef).addClass('fc-header-title');
    //local storage custom view loaders

  }

  //modifying response data
  manuplateResponseData(response) {
    this.getallEvents = response;
    for (var i = 0; i < this.getallEvents.data.length; i++) {
      if (this.getallEvents.data[i].hasOwnProperty("start") || this.getallEvents.data[i].hasOwnProperty("end") || this.getallEvents.data[i].hasOwnProperty("createTime") || this.getallEvents.data[i].hasOwnProperty("lastUpdateTime")) {
        //  moment.parseZone(this.getallEvents.data[i].lastUpdateTime).local().format();
        this.getallEvents.data[i].start = moment(this.getallEvents.data[i].start).format();
        this.getallEvents.data[i].end = moment(this.getallEvents.data[i].end).format();;
        this.getallEvents.data[i].createTime = moment(this.getallEvents.data[i].createTime).format();
        this.getallEvents.data[i].lastUpdateTime = moment(this.getallEvents.data[i].lastUpdateTime).format();
      }
      //event custom colors based on priority
      if (this.getallEvents.data[i].hasOwnProperty("priority")) {
        if (this.getallEvents.data[i].priority === "LOW") {
          this.getallEvents.data[i].className = 'bg-calendar-color-blue txt-color-white calendar-EventFont';
        } else if (this.getallEvents.data[i].priority === "NORMAL") {
          this.getallEvents.data[i].className = 'bg-calendar-color-green txt-color-white calendar-EventFont';
        } else if (this.getallEvents.data[i].priority === "HIGH") {
          this.getallEvents.data[i].className = 'bg-calendar-color-red txt-color-white calendar-EventFont';
        }
      }
    }
    return this.getallEvents;
  }

  // public period = 'Showing';
  public calendarView = 'month';
  changeView(viewperiod: any, selectStatus) {

    if (selectStatus === 'notSelected') {
      var calendarViewData = localStorage.getItem("CalendarView");
      if (calendarViewData != null && calendarViewData != '') {
        viewperiod = calendarViewData;
      } else {
        viewperiod = 'month';
      }
    }
    this.calendarView = viewperiod;
    if (selectStatus === 'selected') {
      this.calendar.fullCalendar('changeView', viewperiod);
    }
    localStorage.setItem('CalendarView', viewperiod);
    return this.calendarView
  }



  public Typeevents: Array<any> = [
     { id: 1, name: 'Meeting', icon: 'fa-group' },
      { id: 2, name: 'Party', icon: 'fa-glass' },
      { id: 3, name: 'Birthday', icon: 'fa-gift' },
      { id: 4, name: 'Travel', icon: 'fa-car' },
      { id: 5, name: 'Holiday', icon: 'fa-bank' },
      { id: 6, name: 'Other', icon: 'fa-lock' },
  ];
  public colorClassNames: Array<any> = [
    {
      bg: 'bg-calendar-color-blue',
      txt: 'txt-color-white',
      title: 'LOW'
    }, {
      bg: 'bg-calendar-color-green',
      txt: 'txt-color-white',
      title: 'NORMAL'
    }, {
      bg: 'bg-calendar-color-red',
      txt: 'txt-color-white',
      title: 'HIGH'
    }
  ];
  next() {
    $('.fc-next-button', this.el.nativeElement).click();
  }

  prev() {
    $('.fc-prev-button', this.el.nativeElement).click();
  }

  today() {
    $('.fc-today-button', this.el.nativeElement).click();
  }


  setIcon(eventData) {
    this.eventType =eventData
  }

  setColorClass(colorClassName) {
    this.activeColorClass = colorClassName
    this.createPriority = colorClassName.title;
    this.updatePriority = colorClassName.title;
  }

  eventAddStartEndTimeComparision: boolean = false;
  eventaddStartValidation: boolean = false;
  eventaddEndValidation: boolean = false;
  createEventData: any;
  addEventData() {
    this.cdr.detectChanges();
    this.eventAddStartEndTimeComparision = false;
    if (this.createPriority === undefined) {
      this.createPriority = this.colorClassNames[0].title;
    }
    if (!moment(this.eventStartDate).isValid()) {
      this.eventaddStartValidation = true;
    } else if (!moment(this.eventEnddate).isValid()) {
      this.eventaddStartValidation = false;
      this.eventaddEndValidation = true;
    } else {
      this.eventaddStartValidation = false;
      this.eventaddEndValidation = false;
      this.eventStartDate = moment(this.eventStartDate).format();
      this.eventEnddate = moment(this.eventEnddate).format();
      if (this.eventStartDate < this.eventEnddate) {
        this.eventAddStartEndTimeComparision = false;
        let date = new Date();
        this.createTime = moment(date).format();
        //this.updateEventEnddate=this.updateEventStartdate;
        this.lastUpdateTime = this.createTime;
        let event = new CalendarEvent(
          this.eventType,
          this.active,
          this.title,
          this.description,
          this.eventStartDate,
          this.eventEnddate,
          this.createTime,
          this.lastUpdateTime,
          this.createPriority,
        );
        this.steps[0].valid = true;
        this.createEventData = event;
      } else {
        this.eventAddStartEndTimeComparision = true;
      }
    }
  }
  //click button add event on modal page
  AddEventDetailsWithProperties() {
    if (Object.keys(this.properties).length != 0) {
      this.createEventData.properties = JSON.stringify(this.properties);
    }

    this.eventsService.addEvent(this.createEventData).then(data => {
      this.popoverAddEvent.hide();
      this.$calendarRef.fullCalendar('refetchEvents');
    });
    this.description = '';
    this.title = '';
    this.eventEnddate = '';
    this.createPriority = '';
    this.eventType = this.Typeevents[0];
    this.activeColorClass = this.colorClassNames[0];

  }

  updateStartEndComparision: boolean = false;
  eventUpdateStartValidation: boolean = false;
  eventUpdateEndValidation: boolean = false;
  updateEventData: any;
  updateEvent() {
    this.updateStartEndComparision = false;
    if (!moment(this.updateEventStartdate).isValid()) {
      this.eventUpdateStartValidation = true;
    } else if (!moment(this.updateEventEnddate).isValid()) {
      this.eventUpdateStartValidation = false;
      this.eventUpdateEndValidation = true;
    } else {
      this.eventUpdateStartValidation = false;
      this.eventUpdateEndValidation = false;
      this.updateEventStartdate = moment(this.updateEventStartdate).format();
      this.updateEventEnddate = moment(this.updateEventEnddate).format();
      if (this.updateEventStartdate < this.updateEventEnddate) {
        this.updateStartEndComparision = false;
        let date = new Date();
        this.updateLastUpdateTime = moment(date).format();
        let updateEvent = new CalendarEvent(
          this.eventType,
          this.updateActive,
          this.updateTitle,
          this.updateDescription,
          this.updateEventStartdate,
          this.updateEventEnddate,
          this.updateCreateTime,
          this.updateLastUpdateTime,
          this.updatePriority,
          this.updateId
        );
        this.updateEventData = updateEvent;
        this.steps[0].valid = true;
      } else {
        this.updateStartEndComparision = true;
      }
    }
  }
  //click button update event on modal page
  updateEventDetailsProperties() {
    if (Object.keys(this.properties).length != 0) {
      this.updateEventData.properties = JSON.stringify(this.properties);
    }
    this.eventsService.updateEvent(this.updateEventData.id, this.updateEventData).then(data => {
      this.popoverupdateEvent.hide();
      console.log('updated');
      this.$calendarRef.fullCalendar('refetchEvents');
    });
    this.description = '';
    this.title = '';
    this.updatePriority = '';
    this.eventType = this.Typeevents[0];
    this.activeColorClass = this.colorClassNames[0];

  }


  //filter setting icons click button
  openFilterDropDown() {
    this.calendarFilterDropDownToggle = 'open';
  }
  //filter dropdown submit button
  onFilterEventSubmit() {
    //closing the dropdwon
    this.calendarFilterDropDownToggle = '';
    //changing the calendar view by caling changeView function
    this.changeView(this.calendarView, 'selected');
    // priorities values and event type values are binded in ngAfterViewInit()
    let filterSubmitData: any = {
      "priorities": this.prioritySelectedValues,
      "eventTypes": this.eventTypeSelectedValues,
      "active": this.activeEvents
    }
    //if objects are selected in filter
    if (this.prioritySelectedValues.length || this.eventTypeSelectedValues.length || this.activeEvents) {
      localStorage.setItem("filterObjectData", JSON.stringify(filterSubmitData));
      this.filterEventsObject = filterSubmitData;
      this.$calendarRef.fullCalendar('refetchEvents');
    }

  }

  //filter dropdown cancel button
  onFilterEventCancel(){
    //clearing the filter event object
      this.filterEventsObject=undefined;
    $('#priorityMultipleSelect').val('').trigger('change');
      $('#evntTypeMultipleSelect').val('').trigger('change');
      this.activeEvents=false;
      localStorage.removeItem("filterObjectData");
      this.$calendarRef.fullCalendar('refetchEvents');
      //closing the dropdown view
      this.calendarFilterDropDownToggle = '';
  }


  notificationNavigation(navigationdate) {
    setTimeout(function () {
      $('#calendar').fullCalendar('changeView', 'agendaDay');
      $('#calendar').fullCalendar('gotoDate', navigationdate);
    }, 100);
    this.calendarView = 'Day';
  }


  ngOnInit() {
    System.import('script-loader!fullcalendar/dist/fullcalendar.min.js').then(() => {
      this.eventType = this.Typeevents[0];
      this.activeColorClass = this.colorClassNames[0];

      //notification route params to calendar
      this.route.params.subscribe(params => {
        this.notificationDate = params;
        if (this.notificationDate.date != undefined) {
          this.notificationNavigation(this.notificationDate.date);
        }
      })

      if (this.notificationDate.date === undefined) {
        let filterLocalStorageObject: any = localStorage.getItem("filterObjectData");
        if (filterLocalStorageObject) {
          filterLocalStorageObject = JSON.parse(filterLocalStorageObject);
          if (filterLocalStorageObject.priorities.length || filterLocalStorageObject.eventTypes.length || filterLocalStorageObject.active) {
            this.filterEventsObject = filterLocalStorageObject;
            $('#priorityMultipleSelect').val(filterLocalStorageObject.priorities).trigger('change');
            $('#evntTypeMultipleSelect').val(filterLocalStorageObject.eventTypes).trigger('change');
            this.activeEvents=filterLocalStorageObject.active;
          }
        }

      }
      //calling the calendar 
      this.render();
    })
  }

  //for filter multiple events input values handling
  public prioritySelectedValues: Array<string> = [];
  public eventTypeSelectedValues: Array<string> = [];
  ngAfterViewInit() {
    //priority
    $('#priorityMultipleSelect').on('change', (eventValues) => {
      this.prioritySelectedValues = $(eventValues.target).val();
      if(this.prioritySelectedValues=== null){
        this.prioritySelectedValues=[];
      }
    });

    //Event Type
    $('#evntTypeMultipleSelect').on('change', (eventValues) => {
      this.eventTypeSelectedValues = $(eventValues.target).val();
      if(this.eventTypeSelectedValues===null){
        this.eventTypeSelectedValues=[];
      }

    });
  };
}




