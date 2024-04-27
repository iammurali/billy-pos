import { CopyIcon } from "@radix-ui/react-icons"

import { Button } from "@/ui/button"
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/ui/dialog"
import { Input } from "@/ui/input"
import { Label } from "@/ui/label"

export function DiscountDialogButton() {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="default">Discount</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Discount</DialogTitle>
          <DialogDescription>
            Apply the discount percentage you want to provide.
          </DialogDescription>
        </DialogHeader>
        <div className="flex items-center space-x-2">
          <div className="grid flex-1 gap-2">
            <Label htmlFor="link" className="sr-only">
              Link
            </Label>
            <Input
              id="link"
              defaultValue="https://ui.shadcn.com/docs/installation"
              type="number"
              step={2}
              min={0}
              max={100}
            />
          </div>
        </div>
        <DialogFooter className="sm:justify-start">
          <DialogClose asChild>
            <Button type="button" variant="secondary">
              Apply
            </Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
