import { RouterModule, Routes } from '@angular/router';
import { DashboardComponent } from './dashboard/dashboard.component';
import { LinkComponent } from './link/link.component';
import { TestGeneratorComponent } from './test-generator/test-generator.component';
import { TestCasesComponent } from './test-cases/test-cases.component';

export const routes: Routes = [
    {'path':'', component:DashboardComponent},
    {'path':'link', component:LinkComponent},
    {'path':'test-generator', component:TestGeneratorComponent},
    { 'path': 'test-cases', component: TestCasesComponent},
    

];
