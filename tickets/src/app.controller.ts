import { Body, Controller, Get, Post } from '@nestjs/common';
import { Ticket } from '@prisma/client';
import { CreateTicketRes } from 'src/dto/create-ticket-res.dto';
import { AppService } from './app.service';

@Controller('/api/v1/tickets')
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get('/')
  getTickets(): Promise<Ticket[]> {
    return this.appService.getTickets();
  }

  @Post('/')
  createTicket(@Body() createTicketRes: CreateTicketRes) {
    return this.appService.createTicket(createTicketRes);
  }
}
