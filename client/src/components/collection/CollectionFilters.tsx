
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';

export function CollectionFilters() {
  return (
    <Card className="mb-6">
      <CardContent className="p-4">
        <div className="mb-4">
          <h3 className="text-lg font-semibold mb-3">Filters and Options</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-6 gap-4 items-end">
          <div>
            <Select>
              <SelectTrigger>
                <SelectValue placeholder="Data show or" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Data</SelectItem>
                <SelectItem value="paid">Paid Only</SelectItem>
                <SelectItem value="pending">Pending Only</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div>
            <Input type="date" defaultValue="2025-06-01" />
          </div>
          
          <div>
            <Select>
              <SelectTrigger>
                <SelectValue placeholder="Select Agent" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Agents</SelectItem>
                <SelectItem value="agent1">Agent 1</SelectItem>
                <SelectItem value="agent2">Agent 2</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div>
            <Select>
              <SelectTrigger>
                <SelectValue placeholder="Select Area" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Areas</SelectItem>
                <SelectItem value="kandrapadu">Kandrapadu</SelectItem>
                <SelectItem value="chennai">Chennai</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div>
            <Select>
              <SelectTrigger>
                <SelectValue placeholder="Select Payment" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Payments</SelectItem>
                <SelectItem value="cash">Cash</SelectItem>
                <SelectItem value="online">Online</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div>
            <Button variant="outline" className="w-full">
              Reset
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
