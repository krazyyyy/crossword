from django.db import models
from datetime import datetime
from django.db import models
from django.urls import reverse
from django.utils import timezone
from django.contrib.auth.models import User
from django.conf import settings
from django.core.mail import send_mail


PUZZLE_TYPES = ((0, 'Blocked'), (1, 'Barred'))
BOOL_DOWN = ((True, 'Down'), (False, 'Across'))

def default_user():
    """Default user for new puzzles."""
    user = User.objects.filter(is_staff=True).order_by('date_joined').first()
    return user.id if user else None

def default_number():
    """Default puzzle number is one greater than the last used."""
    if Puzzle.objects.count():
        return Puzzle.objects.latest('number').number + 1
    return 0

def default_pub_date():
    """Default publish date is way off in the future."""
    return datetime(2100, 1, 1, 0, 0, 0, tzinfo=timezone.get_default_timezone())    

class Puzzle(models.Model):
    """Puzzles to solve. Non-editable fields are unused."""
    name = models.CharField(max_length=64, default="Puzzle Name")
    user = models.ForeignKey(User, models.CASCADE, default=default_user)
    number = models.IntegerField(default=default_number)
    pub_date = models.DateTimeField('publication date', default=default_pub_date)
    size = models.IntegerField(default=15, editable=False)
    type = models.IntegerField(default=0, choices=PUZZLE_TYPES, editable=False)
    instructions = models.TextField(blank=True, null=True, editable=False)
    comments = models.TextField(blank=True)

    class Meta:
        unique_together = (('user', 'number'),)

    def send(self):
        subscriber = Subscriber.objects.all()
        for sub in subscriber:  
            subject = "New Puzzle"
            email_from = settings.EMAIL_HOST_USER
            recipient_list = [sub.email,]
            message = """Hey, It's Weekly Update From xCross Word\n It is to Inform You That New Puzzle Have been Adding\n Be The First To Solve Its\n Best Regrads\n Team Crossword"""
            
            send_mail( subject, message, email_from, recipient_list )
    
    
    def __str__(self):
        return str(self.user.username + ' #' + str(self.number))

    def get_absolute_url(self):
        """Link to go from the puzzle's admin page to the puzzle itself."""
        return reverse('puzzle', args=[self.user.username, self.number])

class Entry(models.Model):
    """Individual clue/answer entries within a puzzle."""
    puzzle = models.ForeignKey(Puzzle, models.CASCADE)
    clue = models.CharField(max_length=200)
    answer = models.CharField(max_length=30)
    x = models.IntegerField()
    y = models.IntegerField()
    number = models.IntegerField(default=00)
    down = models.BooleanField('direction', choices=BOOL_DOWN, default=False)

    class Meta:
        verbose_name_plural = 'entries'

    def __str__(self):
        return self.answer

class Subscriber(models.Model):
    email = models.EmailField()
    name = models.CharField(max_length=64, null=True, blank=True)

# class Progress(models.Model):
#     user = models.CharField(max_length=64)
#     puzzle = models.ForeignKey(Puzzle, on_delete=models.CASCADE)
#     time = models.IntegerField()
    

    # class Meta:
    #     verbose_name_plural = 'Progress'
        

