-- Add new log action for offer-to-order conversion
ALTER TYPE "LogAction" ADD VALUE IF NOT EXISTS 'SIPARISE_DONUSTU';
