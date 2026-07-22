import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { PrismaModule } from './prisma/prisma.module';
import { UsersModule } from './users/users.module';
import { ShiftsModule } from './shifts/shifts.module';
import { AssignmentsModule } from './assignments/assignments.module';
import { AttendancesModule } from './attendances/attendances.module';
import { OvertimesModule } from './overtimes/overtimes.module';
import { DashboardModule } from './dashboard/dashboard.module';
import { ReportsModule } from './reports/reports.module';
import { IncidentsModule } from './incidents/incidents.module';
import { JustificationsModule } from './justifications/justifications.module';
import { NotificationsModule } from './notifications/notifications.module';
import { PositionsModule } from './positions/positions.module';
import { WorkloadSurveysModule } from './workload-surveys/workload-surveys.module';
import { MailModule } from './mail/mail.module';
import { PayrollModule } from './payroll/payroll.module';


@Module({
  imports: [
    AuthModule,
    PrismaModule,
    OvertimesModule,
    UsersModule,
    ShiftsModule,
    AssignmentsModule,
    AttendancesModule,
    DashboardModule,
    ReportsModule,
    IncidentsModule,
    JustificationsModule,
    NotificationsModule,
    PositionsModule,
    WorkloadSurveysModule,
    MailModule,
    PayrollModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
