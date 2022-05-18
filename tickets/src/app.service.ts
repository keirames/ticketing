import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Ticket } from '@prisma/client';
import { CreateTicketRes } from 'src/dto/create-ticket-res.dto';
import { UpdateTicketRes } from 'src/dto/update-ticket-res.dto';
import { PrismaService } from 'src/prisma.service';

@Injectable()
export class AppService {
  constructor(private prismaService: PrismaService) {}

  async getTickets(): Promise<Ticket[]> {
    const tickets = await this.prismaService.ticket.findMany();
    return tickets;
  }

  async getTicket(id: string) {
    const ticket = await this.prismaService.ticket.findUnique({
      where: { id },
    });
    if (!ticket) {
      throw new NotFoundException();
    }

    return ticket;
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

  async updateTicket(updateTicketRes: UpdateTicketRes) {
    const { id, price } = updateTicketRes;

    const ticket = await this.prismaService.ticket.findUnique({
      where: {
        id,
      },
    });
    if (!ticket) {
      throw new NotFoundException();
    }

    const updatedTicket = await this.prismaService.ticket.update({
      where: {
        id,
      },
      data: {
        ...ticket,
        price,
      },
    });

    return updatedTicket;
  }
}
