---
title: Prisma Many to Many encapsulation example repo - testing ground
author: Sebastian Pieczynski
date: 2020-05-20
keywords: graphql, prisma client, apollo server
---

This repo has a single purpose: check how prisma can be used to work with many-to-many relationship when using external table and that table contains additional data.

# Schema Design

It's a book database so there will be:

Books and Characters

Every Book can have many Characters.
The same Character can be present in many Books.

Also there will be an additional table BookCharacters

Books -> BookCharacters <- Characters

BookCharacters holds information about one character in that particular book. For example in one book volume 1 Character A will be a main one but in Volume 2 the main focus can be on Character B.

With this design we allow more metadata to be written about the Character to Book relationship.

We will also use a scalar for `Date` some `enums` for Character Role or Type in a Book as well as for Status of the book ex. if it was READ or if we are NOT_INTERESTED in it.
