import { Component, OnInit, NgModule, Input } from "@angular/core";
import { trigger, state, style, animate, transition, keyframes } from "@angular/animations";
import { Subject, of } from "rxjs";
import { delay } from "rxjs/operators";
import { CommonLoadingStatus } from "../common-loading-config";
@Component({
  selector: "app-common-loading-page",
  templateUrl: "./common-loading-page.component.html",
  styleUrls: ["./common-loading-page.component.scss"],
  animations: [
    trigger("circleBackSatus", [
      state("show", style({opacity: 1, display: "flex" })),
      state("hide", style({ opacity: 0.1, display: "flex"})),
      transition("* => show", [
        animate("500ms", keyframes([
          style({ "opacity": "0.5", display: "flex" }),
          style({ "opacity": "0.8", display: "flex" }),
          style({ "opacity": "1", display: "flex" }),
        ])
        )
      ]),
      transition("* => hide", [
        animate("1000ms", keyframes([
          style({ "opacity": "1", display: "flex" }),
          style({ "opacity": "0", display: "flex" }),
        ])
        )
      ])
    ]),
    trigger("circleLoaderStatus", [
      state("hide", style({ "width": "20px", "height": "20px", "opacity": "0" })),
      state("show", style({ "height": "110px", "width": "110px", "opacity": "0" })),
      transition("* => show", [
        animate("1s 0s", keyframes([
          style({ "opacity": "0.6", "width": "20px", "height": "20px" }),
          style({ "opacity": "0.4", "width": "60px", "height": "60px" }),
          style({ "opacity": "0.2", "width": "110px", "height": "110px" }),
          style({ "opacity": "0" }),
        ]))
      ]),
      transition("* => hide", [
        animate("0s", keyframes([
          style({ "opacity": "0" }),
        ]))
      ]),
    ]),
    trigger("purpleLoaderStatus", [
      state("hide", style({ width: "2020px", height: "2020px", opacity: "0", left: "50%", top: "50%", borderRadius: "50%" })),
      state("show", style({ height: "100%", top: "150%", opacity: "1", border: "0px"})),

      transition("* => show", [
        animate("2s ease", keyframes([
          style({ opacity: "0.2",  width: "2020px", height: "2020px", borderRadius: "50%" }),
          style({ opacity: "0.5", width: "2200px", height: "2200px"}),
          style({ opacity: "1", width: "3000px", height: "3000px", border: "0px"}),
          style({ height: "100%", top: "50%", borderRadius: "0" }),
          style({ height: "100%", top: "150%" }),
        ]))
      ]),
    ])
  ]
})
export class CommonLoadingPageComponent implements OnInit {
  @Input()
  public circleBackSatus: string;
  @Input()
  public circleLoaderStatus: string;
  @Input()
  public purpleLoaderStatus: string;
  @Input()
  public ifStartCircle: boolean;
  /**
   * animation action done call back
   */
  private animationActionEnd: Subject<string>;
  /**
   * current animation excute step
   */
  private currentStep;
  constructor(
  ) {
    this.animationActionEnd = new Subject<string>();
  }
  public ngOnInit() {
  }
  /**
   *
   * @param step operator animation
   */
  public animationAction(step: number): Subject<string> {
    if (step === 0) {
      this.circleBackSatus =  CommonLoadingStatus.showStatus;
      this.circleLoaderStatus = CommonLoadingStatus.showStatus;
      this.ifStartCircle = true;
    } else if (step === 1) {
      this.ifStartCircle = false;
      this.circleLoaderStatus = CommonLoadingStatus.hideStatus;
      this.purpleLoaderStatus = CommonLoadingStatus.showStatus;
      const set = this;
      setTimeout(() => { set.circleBackSatus = CommonLoadingStatus.hideStatus; }, 1500);
    }
    this.currentStep = step;
    return this.animationActionEnd;
  }


  public onAnimationEndEvent(event: AnimationEvent) {
    if (event["fromState"] === "void")
          return;

    if (event["triggerName"] === "purpleLoaderStatus") {
      this.animationActionEnd.next("1");
    }
  }

  public onAnimationEndCircleEvent(event: AnimationEvent) {
    if (this.ifStartCircle) {
      this.circleLoaderStatus = this.circleLoaderStatus === CommonLoadingStatus.hideStatus ? CommonLoadingStatus.showStatus : CommonLoadingStatus.hideStatus;
    } else {
      this.circleLoaderStatus = CommonLoadingStatus.hideStatus;
    }
  }
}
