import { BeforeInsert, BeforeUpdate, Column, DeleteDateColumn, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { Project } from '../../projects/entities/project.entity';
import { Task } from '../../tasks/entities/task.entity';

export type UserRole = 'superadmin' | 'usuario';

@Entity()
export class User {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({
        type: 'text', 
        unique: true ,
        nullable: false
    })
    email: string;

    @Column({
        type: 'text',
        nullable: false
    })
    password: string;

    @Column({
        type: 'text',
    })
    fullname: string;
    
    @Column({
        type: 'enum', 
        enum: ['superadmin', 'usuario'],
        default: 'usuario'
    })
    role: UserRole;

    @Column ({
        type: 'boolean',
        default: true
    })
    isActive: boolean;

    @OneToMany(() => Project, (project) => project.user)
    projects: Project[];

    @OneToMany(() => Task, (task) => task.assignedTo)
    assignedTasks: Task[];

    @DeleteDateColumn()
    deletedAt: Date;

    @BeforeInsert()
    @BeforeUpdate()
    checkFieldsBeforeInsertAndUpdate() {
    if (typeof this.email === 'string') {
        this.email = this.email.toLowerCase().trim();
    }
}

}
