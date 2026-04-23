"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ApprovalWorkflow } from "@/components/properties/approval-workflow";
import { FileCheck } from "lucide-react";
import type { PublicationStatus } from "@/types";

interface ApprovalWorkflowCardProps {
  propertyId: string;
  currentStatus: PublicationStatus;
}

export function ApprovalWorkflowCard({ propertyId, currentStatus }: ApprovalWorkflowCardProps) {
  const [status, setStatus] = useState<PublicationStatus>(currentStatus);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileCheck className="h-4 w-4" /> Approbation
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ApprovalWorkflow
          propertyId={propertyId}
          currentStatus={status}
          onStatusChange={setStatus}
        />
      </CardContent>
    </Card>
  );
}
