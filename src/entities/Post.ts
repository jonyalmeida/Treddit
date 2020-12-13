@Entity()
export class Book {

  @PrimaryKey()
  id!: number;

  @Property()
  createdAt = new Date();

  @Property({ onUpdate: () => new Date() })
  updatedAt = new Date();

  @Property()
  title!: string;

  constructor(title: string, author: Author) {
    this.title = title;
    this.author = author;
  }

}