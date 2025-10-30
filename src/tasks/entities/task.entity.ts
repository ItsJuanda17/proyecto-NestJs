import { Column, CreateDateColumn, Entity, ManyToOne, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';
import { Project } from '../../projects/entities/project.entity';
import { User } from '../../users/entities/user.entity';

export type TaskStatus = 'pending' | 'in-progress' | 'completed' | 'cancelled';
export type TaskPriority = 'low' | 'medium' | 'high';

@Entity()
export class Task {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({
    type: 'text',
    nullable: false,
  })
  title: string;

  @Column({
    type: 'text',
    nullable: true,
  })
  description: string;

  @Column({
    type: 'enum',
    enum: ['pending', 'in-progress', 'completed', 'cancelled'],
    default: 'pending',
  })
  status: TaskStatus;

  @Column({
    type: 'enum',
    enum: ['low', 'medium', 'high'],
    default: 'medium',
  })
  priority: TaskPriority;

  @Column({
    type: 'timestamp',
    nullable: true,
  })
  dueDate: Date;

  @ManyToOne(() => Project, (project) => project.tasks, { eager: false, onDelete: 'CASCADE' })
  project: Project;

  @Column()
  projectId: string;

  @ManyToOne(() => User, (user) => user.assignedTasks, { eager: false, nullable: true })
  assignedTo: User;

  @Column({ nullable: true })
  assignedToId: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
