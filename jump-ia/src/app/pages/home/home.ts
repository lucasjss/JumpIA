import { Component } from '@angular/core';
import { HeaderComponent } from '../../components/header/header';
import { HeroComponent } from '../../components/hero/hero';
import { MissionComponent } from '../../components/mission-section/mission-section';
import { HowItWorksComponent } from '../../components/how-it-works/how-it-works';
import { FeaturesComponent } from '../../components/features/features';
import { StatsComponent } from '../../components/stats/stats';
import { CtaComponent } from '../../components/cta/cta';
import { FooterComponent } from '../../components/footer/footer';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [
    HeaderComponent,
    HeroComponent,
    MissionComponent,
    HowItWorksComponent,
    FeaturesComponent,
    StatsComponent,
    CtaComponent,
    FooterComponent,
],
  template: `
    <app-header></app-header>
    <app-hero></app-hero>
    <app-mission></app-mission>
    <app-how-it-works></app-how-it-works>
    <app-features></app-features>
    <app-stats></app-stats>
    <app-cta></app-cta>
    <app-footer></app-footer>
  `,
})
export class HomeComponent {}
