
import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import IdeaChat from '../components/business/IdeaChat';

export default function ExistingBusiness({ currentJourney }) {
  return (
    <div>
      <Tabs defaultValue="growth-plan">
        <TabsList>
          <TabsTrigger value="growth-plan">Growth Plan</TabsTrigger>
          <TabsTrigger value="problem-solver">Problem Solver</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>
        <TabsContent value="growth-plan">
          <IdeaChat currentJourney={currentJourney} workflow="growth" />
        </TabsContent>
        <TabsContent value="problem-solver">
          <p>Problem Solver content will go here.</p>
        </TabsContent>
        <TabsContent value="analytics">
          <p>Analytics content will go here.</p>
        </TabsContent>
      </Tabs>
    </div>
  );
}
