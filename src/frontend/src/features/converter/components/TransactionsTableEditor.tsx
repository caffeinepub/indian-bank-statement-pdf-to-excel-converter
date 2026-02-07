import { useState } from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Trash2, Edit2, Check, X } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';
import type { Transaction } from '../types';

interface TransactionsTableEditorProps {
  transactions: Transaction[];
  onTransactionsChange: (transactions: Transaction[]) => void;
}

export function TransactionsTableEditor({
  transactions,
  onTransactionsChange,
}: TransactionsTableEditorProps) {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editValues, setEditValues] = useState<Partial<Transaction>>({});

  const handleEdit = (transaction: Transaction) => {
    setEditingId(transaction.id);
    setEditValues(transaction);
  };

  const handleSave = () => {
    if (editingId) {
      const updated = transactions.map((t) =>
        t.id === editingId ? { ...t, ...editValues } : t
      );
      onTransactionsChange(updated);
      setEditingId(null);
      setEditValues({});
    }
  };

  const handleCancel = () => {
    setEditingId(null);
    setEditValues({});
  };

  const handleDelete = (id: string) => {
    onTransactionsChange(transactions.filter((t) => t.id !== id));
  };

  return (
    <div className="border rounded-lg">
      <ScrollArea className="h-[500px]">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[120px]">Date</TableHead>
              <TableHead>Description</TableHead>
              <TableHead className="w-[140px]">Reference</TableHead>
              <TableHead className="text-right w-[120px]">Debit</TableHead>
              <TableHead className="text-right w-[120px]">Credit</TableHead>
              <TableHead className="text-right w-[120px]">Balance</TableHead>
              <TableHead className="w-[100px]">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {transactions.map((transaction) => (
              <TableRow key={transaction.id}>
                <TableCell>
                  {editingId === transaction.id ? (
                    <Input
                      value={editValues.date || ''}
                      onChange={(e) =>
                        setEditValues({ ...editValues, date: e.target.value })
                      }
                      className="h-8"
                    />
                  ) : (
                    transaction.date
                  )}
                </TableCell>
                <TableCell>
                  {editingId === transaction.id ? (
                    <Input
                      value={editValues.description || ''}
                      onChange={(e) =>
                        setEditValues({ ...editValues, description: e.target.value })
                      }
                      className="h-8"
                    />
                  ) : (
                    transaction.description
                  )}
                </TableCell>
                <TableCell>
                  {editingId === transaction.id ? (
                    <Input
                      value={editValues.reference || ''}
                      onChange={(e) =>
                        setEditValues({ ...editValues, reference: e.target.value })
                      }
                      className="h-8"
                      placeholder="Optional"
                    />
                  ) : (
                    transaction.reference || ''
                  )}
                </TableCell>
                <TableCell className="text-right">
                  {editingId === transaction.id ? (
                    <Input
                      value={editValues.debit || ''}
                      onChange={(e) =>
                        setEditValues({ ...editValues, debit: e.target.value })
                      }
                      className="h-8"
                    />
                  ) : (
                    transaction.debit
                  )}
                </TableCell>
                <TableCell className="text-right">
                  {editingId === transaction.id ? (
                    <Input
                      value={editValues.credit || ''}
                      onChange={(e) =>
                        setEditValues({ ...editValues, credit: e.target.value })
                      }
                      className="h-8"
                    />
                  ) : (
                    transaction.credit
                  )}
                </TableCell>
                <TableCell className="text-right">
                  {editingId === transaction.id ? (
                    <Input
                      value={editValues.balance || ''}
                      onChange={(e) =>
                        setEditValues({ ...editValues, balance: e.target.value })
                      }
                      className="h-8"
                    />
                  ) : (
                    transaction.balance
                  )}
                </TableCell>
                <TableCell>
                  {editingId === transaction.id ? (
                    <div className="flex gap-1">
                      <Button size="icon" variant="ghost" onClick={handleSave}>
                        <Check className="h-4 w-4" />
                      </Button>
                      <Button size="icon" variant="ghost" onClick={handleCancel}>
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ) : (
                    <div className="flex gap-1">
                      <Button
                        size="icon"
                        variant="ghost"
                        onClick={() => handleEdit(transaction)}
                      >
                        <Edit2 className="h-4 w-4" />
                      </Button>
                      <Button
                        size="icon"
                        variant="ghost"
                        onClick={() => handleDelete(transaction.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </ScrollArea>
    </div>
  );
}
