#!/bin/bash
sed -i "s/response TEXT CHECK (response IN ('yes', 'no', 'maybe')) NOT NULL,/response TEXT CHECK (response IN ('yes', 'no', 'maybe')) NOT NULL,\n  guest_count INT DEFAULT 1,/g" database-schema.sql
