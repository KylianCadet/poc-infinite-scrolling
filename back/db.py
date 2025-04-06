from peewee import CharField, Model, SqliteDatabase, PrimaryKeyField, TextField

db = SqliteDatabase('poc.db')

class Item(Model):
    id = PrimaryKeyField()
    name = CharField()
    description = CharField()
    tags = TextField()

    class Meta:
        database = db # This model uses the "people.db" database.

db.connect()
db.create_tables([Item])

for i in range(1, 1000):
    Item.insert(
        id=i,
        name=f"name {str(i)}",
        description=f"description {str(i)}",
        tags=f"tags {str(i)}"
    ).on_conflict_replace().execute()

