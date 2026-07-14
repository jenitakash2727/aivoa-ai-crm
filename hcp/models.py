from django.db import models

class HCP(models.Model):
    name = models.CharField(max_length=255)
    specialty = models.CharField(max_length=255, blank=True)
    hospital = models.CharField(max_length=255, blank=True)
    email = models.EmailField(max_length=255, blank=True)
    phone = models.CharField(max_length=50, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    
    def __str__(self):
        return self.name
    
    class Meta:
        ordering = ['name']

class Interaction(models.Model):
    INTERACTION_TYPES = [
        ('meeting', 'Meeting'),
        ('call', 'Phone Call'),
        ('email', 'Email'),
        ('virtual', 'Virtual'),
        ('other', 'Other'),
    ]
    
    hcp = models.ForeignKey(HCP, on_delete=models.CASCADE, related_name='interactions')
    interaction_date = models.DateTimeField(auto_now_add=True)
    type = models.CharField(max_length=50, choices=INTERACTION_TYPES)
    summary = models.TextField()
    key_points = models.TextField(blank=True, default='[]')
    sentiment = models.CharField(max_length=50, blank=True)
    next_steps = models.TextField(blank=True)
    created_by = models.CharField(max_length=255, default='field_rep')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    def __str__(self):
        return f"{self.hcp.name} - {self.type}"
    
    class Meta:
        ordering = ['-interaction_date']