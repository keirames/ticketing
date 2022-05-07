import { BadRequestException, Injectable } from '@nestjs/common';
import { Ticket } from '@prisma/client';
import { CreateTicketRes } from 'src/dto/create-ticket-res.dto';
import { PrismaService } from 'src/prisma.service';

@Injectable()
export class AppService {
  constructor(private prismaService: PrismaService) {}

  async getTickets(): Promise<Ticket[]> {
    const tickets = await this.prismaService.ticket.findMany();
    return tickets;
  }

  async createTicket(createTicketRes: CreateTicketRes) {
    const { title, price } = createTicketRes;

    const isExist = await this.prismaService.ticket.findFirst({
      where: {
        title,
      },
    });
    if (isExist) {
      throw new BadRequestException();
    }

    const ticket = await this.prismaService.ticket.create({
      data: {
        title,
        price,
      },
    });

    return ticket;
  }
}
