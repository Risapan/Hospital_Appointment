package com.hospital.appointment.ui;

import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Tag;
import org.junit.jupiter.api.Test;
import org.openqa.selenium.By;
import org.openqa.selenium.OutputType;
import org.openqa.selenium.TakesScreenshot;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.WebElement;
import org.openqa.selenium.chrome.ChromeDriver;
import org.openqa.selenium.chrome.ChromeOptions;
import org.openqa.selenium.support.ui.ExpectedConditions;
import org.openqa.selenium.support.ui.WebDriverWait;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.StandardCopyOption;
import java.time.Duration;

import static org.assertj.core.api.Assertions.assertThat;

/**
 * Selenium UI tests against a running app (frontend + backend).
 * Run with:  UI_BASE_URL=http://localhost:5174 mvn test -Pui -Dtest='*UiTest'
 * Screenshots are saved to target/ui-screenshots/ as test evidence.
 */
@Tag("ui")
class LoginUiTest {

    private static final String BASE = System.getenv().getOrDefault("UI_BASE_URL", "http://localhost:5174");
    private WebDriver driver;
    private WebDriverWait wait;

    @BeforeEach
    void openBrowser() {
        ChromeOptions options = new ChromeOptions();
        if (!"false".equals(System.getenv("UI_HEADLESS"))) {
            options.addArguments("--headless=new");
        }
        options.addArguments("--window-size=1280,900");
        driver = new ChromeDriver(options);   // Selenium Manager downloads a matching chromedriver
        wait = new WebDriverWait(driver, Duration.ofSeconds(15));
    }

    @AfterEach
    void closeBrowser() {
        if (driver != null) driver.quit();
    }

    private void screenshot(String name) throws IOException {
        Path dir = Path.of("target", "ui-screenshots");
        Files.createDirectories(dir);
        Path png = ((TakesScreenshot) driver).getScreenshotAs(OutputType.FILE).toPath();
        Files.copy(png, dir.resolve(name + ".png"), StandardCopyOption.REPLACE_EXISTING);
    }

    private void signIn(String email, String password) {
        driver.get(BASE + "/login");
        WebElement emailBox = wait.until(ExpectedConditions.visibilityOfElementLocated(By.cssSelector("input[type=email]")));
        emailBox.sendKeys(email);
        driver.findElement(By.cssSelector("input[type=password]")).sendKeys(password);
        driver.findElement(By.cssSelector("form button[type=submit]")).click();
    }

    @Test
    @DisplayName("UI-01 patient signs in and lands on the patient dashboard")
    void patientLogin() throws IOException {
        signIn("patient@hospital.lk", "patient123");
        wait.until(ExpectedConditions.urlContains("/patient/dashboard"));
        screenshot("UI-01-patient-dashboard");
        assertThat(driver.getCurrentUrl()).contains("/patient/dashboard");
    }

    @Test
    @DisplayName("UI-02 admin signs in and lands on the admin dashboard")
    void adminLogin() throws IOException {
        signIn("admin@hospital.lk", "admin123");
        wait.until(ExpectedConditions.urlContains("/admin/dashboard"));
        screenshot("UI-02-admin-dashboard");
        assertThat(driver.getCurrentUrl()).contains("/admin/dashboard");
    }

    @Test
    @DisplayName("UI-03 wrong password shows an error and stays on /login")
    void wrongPassword() throws IOException {
        signIn("patient@hospital.lk", "not-the-password");
        WebElement error = wait.until(ExpectedConditions.visibilityOfElementLocated(
                By.xpath("//*[contains(text(),'Invalid email or password')]")));
        screenshot("UI-03-invalid-login");
        assertThat(error.isDisplayed()).isTrue();
        assertThat(driver.getCurrentUrl()).contains("/login");
    }

    @Test
    @DisplayName("UI-04 visiting a protected page while signed out redirects to /login")
    void protectedPageRedirects() throws IOException {
        driver.get(BASE + "/admin/dashboard");
        wait.until(ExpectedConditions.urlContains("/login"));
        screenshot("UI-04-redirect-to-login");
        assertThat(driver.getCurrentUrl()).contains("/login");
    }
}
