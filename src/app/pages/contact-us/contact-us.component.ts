import { Component } from "@angular/core"
import { FormBuilder, FormGroup, Validators } from "@angular/forms"
import { ToastrService } from "ngx-toastr"

@Component({
  selector: "app-contact-us",
  templateUrl: "./contact-us.component.html",
  styleUrls: ["./contact-us.component.scss"],
})
export class ContactUsComponent {
  contactForm: FormGroup

  constructor(
    private fb: FormBuilder,
    private toastr: ToastrService,
  ) {
    this.contactForm = this.fb.group({
      name: ["", Validators.required],
      email: ["", [Validators.required, Validators.email]],
      subject: ["", Validators.required],
      message: ["", Validators.required],
    })
  }

  onSubmit() {
    if (this.contactForm.valid) {
      // In a real application, you would send this data to a backend service.
      // For now, we'll just simulate a successful submission.
      console.log("Form Submitted!", this.contactForm.value)
      this.toastr.success("Your message has been sent!", "Success")
      this.contactForm.reset()
    } else {
      this.toastr.error("Please fill in all required fields correctly.", "Error")
    }
  }
}
