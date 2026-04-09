import { createRouter, createWebHistory } from "vue-router";
import StudentListView from "../views/StudentListView.vue";
import TeamListView from "../views/TeamListView.vue";
import TeamManageView from "../views/TeamManageView.vue";
import DinoGameView from "../views/DinoGameView.vue";
import LeaderboardView from "../views/LeaderboardView.vue";
import NotFoundView from "../views/NotFoundView.vue";

const routes = [
  {
    path: "/",
    redirect: "/students",
  },
  {
    path: "/students",
    name: "StudentList",
    component: StudentListView,
  },
  {
    path: "/teams",
    name: "TeamList",
    component: TeamListView,
  },
  {
    path: "/team-manager",
    name: "TeamManager",
    component: TeamManageView,
  },
  {
    path: "/dino",
    name: "DinoGame",
    component: DinoGameView,
  },
  {
    path: "/leaderboard",
    name: "Leaderboard",
    component: LeaderboardView,
  },
  {
    path: "/:pathMatch(.*)*",
    name: "NotFound",
    component: NotFoundView,
  },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

export default router;
