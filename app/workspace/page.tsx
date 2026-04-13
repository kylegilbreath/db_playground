"use client";

import * as React from "react";
import { useRouter } from "next/navigation";

import { DefaultButton } from "@/components/DefaultButton";
import { Icon } from "@/components/icons";
import { PrimaryButton } from "@/components/PrimaryButton";
import { Table, TableCell, TableCellContent, TableRow } from "@/components/Table";
import { SETTINGS_SKILLS } from "@/components/GenieCodePanel/GenieChatCore";

export default function WorkspacePage() {
  const router = useRouter();

  return (
    <div className="flex h-full flex-col gap-md p-lg">
      {/* Breadcrumb */}
      <div className="flex items-center gap-xs text-hint text-text-secondary">
        <button type="button" className="hover:text-text-primary hover:underline" onClick={() => router.push("/")}>Workspace</button>
        <span>/</span>
        <button type="button" className="hover:text-text-primary hover:underline">Users</button>
        <span>/</span>
        <button type="button" className="hover:text-text-primary hover:underline">kyle.gilbreath@databricks.com</button>
        <span>/</span>
        <button type="button" className="hover:text-text-primary hover:underline">assistant</button>
        <span>/</span>
      </div>

      {/* Page header */}
      <div className="flex items-center gap-sm">
        <h1 className="text-title2 font-semibold text-text-primary">skills</h1>
        <Icon name="starIcon" size={16} className="text-text-secondary" />
        <div className="flex-1" />
        <DefaultButton>Send feedback</DefaultButton>
        <DefaultButton>Share</DefaultButton>
        <PrimaryButton>Create</PrimaryButton>
      </div>

      {/* Toolbar */}
      <div className="flex items-center gap-sm">
        <div className="flex h-8 w-64 items-center gap-xs rounded-sm border border-border bg-background-primary px-sm">
          <Icon name="searchIcon" size={14} className="shrink-0 text-text-secondary" />
          <span className="text-paragraph text-text-placeholder">Search</span>
        </div>
        <DefaultButton menu>Type</DefaultButton>
        <DefaultButton menu>Owner</DefaultButton>
        <div className="flex-1" />
        <DefaultButton menu>Last modified</DefaultButton>
      </div>

      {/* Table */}
      <Table>
        <TableRow state="Header">
          <TableCell><TableCellContent type="Header">Name</TableCellContent></TableCell>
          <TableCell><TableCellContent type="Header">Type</TableCellContent></TableCell>
          <TableCell><TableCellContent type="Header">Owner</TableCellContent></TableCell>
          <TableCell><TableCellContent type="Header">Created</TableCellContent></TableCell>
          <TableCell><TableCellContent type="Header">Last updated</TableCellContent></TableCell>
          <TableCell><TableCellContent type="Actions" /></TableCell>
        </TableRow>
        {SETTINGS_SKILLS.map((skill) => (
          <TableRow key={skill.id}>
            <TableCell>
              <TableCellContent type="Name">
                <div className="flex items-center gap-xs">
                  <Icon name="folderOutlinedIcon" size={14} className="shrink-0 text-blue-500" />
                  <span className="truncate text-paragraph text-action-tertiary-text-default hover:underline cursor-pointer" onClick={() => router.push(`/workspace/${skill.id}`)}>{skill.name}</span>
                </div>
              </TableCellContent>
            </TableCell>
            <TableCell><TableCellContent type="Text">Folder</TableCellContent></TableCell>
            <TableCell><TableCellContent type="User">Kyle Gil...</TableCellContent></TableCell>
            <TableCell><TableCellContent type="Text">Apr 10, 2026</TableCellContent></TableCell>
            <TableCell><TableCellContent type="Text">Apr 10, 2026</TableCellContent></TableCell>
            <TableCell><TableCellContent type="Actions" /></TableCell>
          </TableRow>
        ))}
      </Table>
    </div>
  );
}
