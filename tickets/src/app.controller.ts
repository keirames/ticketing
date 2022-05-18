import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
} from '@nestjs/common';
import { Ticket } from '@prisma/client';
import { CreateTicketRes } from 'src/dto/create-ticket-res.dto';
import { UpdateTicketRes } from 'src/dto/update-ticket-res.dto';
import { AppService } from './app.service';

@Controller('/api/v1/tickets')
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get('/')
  getTickets(): Promise<Ticket[]> {
    return this.appService.getTickets();
  }

  @Get('/:id')
  getTicket(@Param('id') id: string): Promise<Ticket> {
    return this.appService.getTicket(id);
  }

  @Post('/')
  createTicket(@Body() createTicketRes: CreateTicketRes) {
    return this.appService.createTicket(createTicketRes);
  }

  @Put('/')
  updateTicket(@Body() updateTicketRes: UpdateTicketRes) {
    return this.appService.updateTicket(updateTicketRes);
  }
}
