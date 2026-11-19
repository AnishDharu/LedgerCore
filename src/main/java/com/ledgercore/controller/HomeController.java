package com.ledgercore.controller;

import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;

@Controller
public class HomeController {

    @GetMapping("/")
    public String home(Model model) {
        model.addAttribute("projectName", "LedgerCore");
        model.addAttribute("message", "Your banking-inspired platform is ready to build.");
        return "index";
    }
}
